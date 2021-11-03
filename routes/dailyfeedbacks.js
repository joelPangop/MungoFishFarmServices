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
db.Site = require("../models/Site")(sequelize, Sequelize)
db.Tank = require("../models/Tank")(sequelize, Sequelize)
db.Net = require("../models/Net")(sequelize, Sequelize)
db.Users = require("../models/Users")(sequelize, Sequelize)
db.Mail = require("../models/Mail")(sequelize, Sequelize)
db.DailyFeedbacks = require("../models/DailyFeedback")(sequelize, Sequelize)
db.Approbation = require("../models/Approbation")(sequelize, Sequelize)

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

router.get('/', function (req, res, next) {
    db.DailyFeedbacks.findAll({}).then(dailyfeedbacks => {
        console.log('dailyfeedback', dailyfeedbacks);
        res.status(200).send(dailyfeedbacks);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.get('/:id', function (req, res, next) {
    const id = req.params.id;
    db.DailyFeedbacks.findOne({where: {id: id}}).then(dailyfeedback => {
        console.log('dailyfeedback', dailyfeedback);
        res.status(200).send(dailyfeedback);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.post('/', function (req, res, next) {
    const dailyfeedback = req.body.dailyFeedback;
    const user = req.body.user;
    db.DailyFeedbacks.create({
        qtyAlmt09AM: dailyfeedback.qtyAlmt09AM,
        qtyAlmt12PM: dailyfeedback.qtyAlmt12PM,
        qtyAlmt03PM: dailyfeedback.qtyAlmt03PM,
        quantity: dailyfeedback.quantity,
        cumulAlmt: dailyfeedback.cumulAlmt,
        nbMale: dailyfeedback.nbMale,
        nbFemale: dailyfeedback.nbFemale,
        temp06AM: dailyfeedback.temp06AM,
        temp03PM: dailyfeedback.temp03PM,
        oxyg03PM: dailyfeedback.oxyg03PM,
        oxyg06AM: dailyfeedback.oxyg06AM,
        nh3: dailyfeedback.nh3,
        nh2: dailyfeedback.nh2,
        ph: dailyfeedback.ph,
        remark: dailyfeedback.remark,
        date: dailyfeedback.date,
        tankID: dailyfeedback.tankID,
        productID: dailyfeedback.productID,
        submitted: dailyfeedback.submitted
    }, {
        fields: ['qtyAlmt09AM', 'qtyAlmt12PM', 'qtyAlmt03PM', 'quantity', 'cumulAlmt', 'nbMale', 'nbFemale', 'temp06AM', 'temp03PM', 'oxyg03PM', 'oxyg06AM',
            'nh3', 'nh2', 'ph', 'remark', 'date', 'tankID', 'productID', 'submitted']
    }).then(async data => {

        if (data.dataValues.submitted === true) {
            const id = user.supervisorID;
            db.Users.findOne({where: {id: id}}).then(async (supervisor) => {
                console.log('User', supervisor);
                const mail = {};
                mail.to = supervisor.email;
                mail.from = 'joelpangop@mungofishfarm.net';
                mail.subject = "Daily feeding successfully";
                mail.text = user.userName + " has submitted the daily feeding: " + user.userName + "_" + data.dataValues.date;

                db.Approbation.create({
                    daily_feedbackID: data.dataValues.id,
                    userID: user.id,
                    supervisorID: supervisor.id,
                    status: "",
                    createdAt: Date.now(),
                }, {fields: ['daily_feedbackID', 'userID', 'supervisorID', 'status', 'createdAt']}).then(async (approbation) => {
                    console.log(approbation)
                    await send_confirm_mail(mail).then((resp) => {
                        console.log(resp);
                        res.status(200).json({
                            message: "new dailyfeedback created: " + user.username + "_" + moment(data.dataValues.date).format('MMMM_DD_YYYY'),
                            status: "Success"
                        });
                    });
                })
                // res.status(200).send(user);
            }).catch(err => {
                console.log(err);
                res.status(501).send(err);
            });
        } else {
            res.status(200).json({
                message: "new dailyfeedback created: " + user.username + "_" + data.dataValues.date,
                status: "Success"
            });
        }

    }).catch(err => {
        console.log(err);
        res.status(501).json({message: err, status: "Failed"});
    });

})

router.put('/:id', async function (req, res, next) {
    const dailyfeedback = req.body;
    const id = req.params.id;
    await db.DailyFeedbacks.update({
        qtyAlmt09AM: dailyfeedback.qtyAlmt09AM,
        qtyAlmt12PM: dailyfeedback.qtyAlmt12PM,
        quantity: dailyfeedback.quantity,
        qtyAlmt03PM: dailyfeedback.qtyAlmt03PM,
        cumulAlmt: dailyfeedback.cumulAlmt,
        nbMale: dailyfeedback.nbMale,
        nbFemale: dailyfeedback.nbFemale,
        temp06AM: dailyfeedback.temp06AM,
        temp03PM: dailyfeedback.temp03PM,
        oxyg03PM: dailyfeedback.oxyg03PM,
        oxyg06AM: dailyfeedback.oxyg06AM,
        nh3: dailyfeedback.nh3,
        nh2: dailyfeedback.nh2,
        ph: dailyfeedback.ph,
        remark: dailyfeedback.remark,
        // date: dailyfeedback.date,
        tankID: dailyfeedback.tankID,
        productID: dailyfeedback.productID,
        submitted: dailyfeedback.submitted
    }, {
        where: {
            id: id
        }
    }).then((resp) => {
        res.status(200).json({message: "DailyFeedback updated: ", status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

router.delete('/all', async function (req, res, next) {
    const id = JSON.parse(req.query.ids);
    await db.DailyFeedbacks.destroy({
        where: {
            id: id
        }
    }).then((resp) => {
        res.status(200).json({message: "DailyFeedback deleted !!!"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

async function send_confirm_mail(mail) {
    // const mail = {};
    // mail.to = req.body.to;
    // mail.from = 'joelpangop@mungofishfarm.net';
    // mail.subject = req.body.subject;
    // mail.text = req.body.text;
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

router.get('/approbations/all', function (req, res, next) {
    db.Approbation.findAll({}).then(approbations => {
        console.log('approbations', approbations);
        res.status(200).send(approbations);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.get('/approbation/one/:id', function (req, res, next) {
    const id = req.params.id;
    db.Approbation.findOne({where: {id: id}}).then(approbations => {
        console.log('approbations', approbations);
        res.status(200).send(approbations);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

module.exports = router;
