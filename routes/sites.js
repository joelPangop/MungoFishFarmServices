const express = require('express');
const router = express.Router();

const cors = require('cors')
router.use(cors({
    allowedOrigins: [
        '*'
    ]
}));

const {Sequelize} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;
const sequelize = require('../connection/dbConnection').sequelize
db.Site = require("../models/Site")(sequelize, Sequelize)
db.Tank = require("../models/Tank")(sequelize, Sequelize)
db.Net = require("../models/Net")(sequelize, Sequelize)

router.get('/', function (req, res, next) {
    db.Site.findAll({}).then(sites => {
        console.log('Sites', sites);
        res.status(200).send(sites);
    })
});

router.get('/:id', function (req, res, next) {
    const id = req.params.id;
    db.Site.findOne({where: {id: id}}).then(site => {
        console.log('Sites', site);
        res.status(200).send(site);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.post('/', function (req, res, next) {
    const site = req.body;
    db.Site.create({
        name: site.name
    }, {fields: ['name']}).then(async data => {
        res.status(200).json({message: "new site created: " + data.dataValues.name, site: data.dataValues, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})
//
// router.delete('/:id', async function (req, res, next) {
//     const id = req.params.id;
//     await db.Site.destroy({
//         where: {
//             id: id
//         }
//     }).then((resp) => {
//         res.status(200).json({message: "Site deleted", status: "Success"});
//     }).catch(err => {
//         console.log(err);
//         res.status(501).send(err);
//     });
// })

router.delete('/many', async function (req, res, next) {
    const id = JSON.parse(req.query.ids);
    await db.Site.destroy({
        where: {
            id: id
        }
    }).then((resp) => {
        res.status(200).json({message: "Site deleted", status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send({message: err.message, status: "Failed"});
    });
})

router.put('/:id', async function (req, res, next) {
    const site = req.body;
    const id = req.params.id;
    await db.Site.update({name: site.name}, {
        where: {
            id: id
        }
    }).then((resp) => {
        res.status(200).json({message: "Site updated: " + req.body.name, site: site, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });

})

router.get('tank/:siteID', async function (req, res, next) {
    const siteID = req.params.siteID;
    await sequelize.query(
        'SELECT * FROM sites as s inner join tanks as t on d.siteID = s.id WHERE s.id = :siteID',
        {
            replacements: { siteID: siteID },
            type: QueryTypes.SELECT
        }
    ).then(tank => {
        console.log('tank', tank);
        res.status(200).send(tank);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

module.exports = router;