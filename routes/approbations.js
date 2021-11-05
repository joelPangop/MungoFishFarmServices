const router = require('express').Router();

const cors = require('cors')
router.use(cors({
    allowedOrigins: [
        '*'
    ]
}));
const moment = require('moment');

const {Sequelize} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;
const sequelize = require('../connection/dbConnection').sequelize
db.Users = require("../models/Users")(sequelize, Sequelize)
db.Mail = require("../models/Mail")(sequelize, Sequelize)
db.DailyFeedbacks = require("../models/DailyFeedback")(sequelize, Sequelize)
db.Approbation = require("../models/Approbation")(sequelize, Sequelize)

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

router.get('/:id', function (req, res, next) {
    const id = req.params.id;
    db.Approbation.findOne({where: {id: id}}).then(approbations => {
        console.log('approbations', approbations);
        res.status(200).send(approbations);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.put('/:id', function (req, res, next) {
    const id = req.params.id;
    const data = req.body;
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);

    if (data.approbation.status === "Approved") {
        data.approbation.approvedAt = today;
        data.approbation.rejectedAt = undefined;
    } else {
        data.approbation.rejectedAt = today;
        data.approbation.approvedAt = undefined;
    }

    db.Approbation.update({
        daily_feedbackID: data.approbation.daily_feedbackID,
        userID: data.approbation.userID,
        supervisorID: data.approbation.supervisorID,
        status: data.approbation.status,
        // createdAt: data.approbation.createdAt,
        approvedAt: data.approbation.approvedAt,
        rejectedAt: data.approbation.rejectedAt,
        remark: data.approbation.remark
    }, {
        where: {
            id: id
        }
    }).then((resp) => {

        db.Users.findOne({where: {id: data.approbation.userID}}).then((user) => {
            const mail_to_user = {};
            mail_to_user.to = user.dataValues.email;
            mail_to_user.from = 'joelpangop@mungofishfarm.net';
            mail_to_user.subject = "Daily feeding " + data.approbation.status;
            const date_action = data.approbation.status === "Approved" ? data.approbation.approvedAt.toString() : data.approbation.rejectedAt.toString()
            mail_to_user.text = date_action + ": " + data.supervisor.userName + " has " + data.approbation.status + " the daily feeding submitted ";

            const mail_to_supervisor = {};
            mail_to_supervisor.to = data.supervisor.email;
            mail_to_supervisor.from = 'joelpangop@mungofishfarm.net';
            mail_to_supervisor.subject = "Daily feeding " + data.approbation.status;
            mail_to_supervisor.text = date_action + ": " + " You " + data.approbation.status + " the daily feeding submitted " + " by "+user.dataValues.userName;

            send_confirm_mail(mail_to_user);
            send_confirm_mail(mail_to_supervisor);

            res.status(200).send({message: "Daily Feeding " + data.approbation.status, status: "Success"});
        })

    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    })
});

router.get('/supervisor/:id', function (req, res, next) {
    const id = req.params.id;
    db.Approbation.findAll({where: {supervisorID: id}}).then(approbations => {
        console.log('approbations', approbations);
        res.status(200).send(approbations);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.get('/user/:id', function (req, res, next) {
    const id = req.params.id;
    db.Approbation.findAll({where: {userID: id}}).then(approbations => {
        console.log('approbations', approbations);
        res.status(200).send(approbations);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.get('/daily_feedbackID/:id', function (req, res, next) {
    const id = req.params.id;
    db.Approbation.findOne({where: {daily_feedbackID: id}}).then(approbations => {
        console.log('approbations', approbations);
        res.status(200).send(approbations);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

async function send_confirm_mail(mail) {
    console.log('mail', mail);

    const transporter = nodemailer.createTransport(smtpTransport({
        name: 'hostgator',
        host: 'gator3231.hostgator.com',
        secure: true,
        port: 465,
        auth: {
            user: 'joelpangop@mungofishfarm.net',
            pass: 'Jojo0689'
        }
    }));

    const mailOptions = {
        from: mail.from,
        to: mail.to,
        subject: mail.subject,
        text: mail.text
    };

    await transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
            console.log(error);
            return "Not found";
        } else {
            console.log('Email sent: ' + info.response);
            await db.Mail.create({
                from: mail.from,
                to: mail.to,
                subject: mail.subject,
                text: mail.text
            }, {fields: ['from', 'to', 'subject', 'text']}).then(async (resp) => {
                return resp.dataValues;
                // res.status(200).json(resp.dataValues);
            })
        }
    });

}

module.exports = router;
