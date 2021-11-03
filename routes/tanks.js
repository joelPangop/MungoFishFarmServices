const router = require('express').Router();

const cors = require('cors')
router.use(cors({
    allowedOrigins: [
        '*'
    ]
}));

const {Sequelize, QueryTypes } = require('sequelize');
const db = {};
db.Sequelize = Sequelize;
const sequelize = require('../connection/dbConnection').sequelize
db.Site = require("../models/Site")(sequelize, Sequelize)
db.Tank = require("../models/Tank")(sequelize, Sequelize)
db.Net = require("../models/Net")(sequelize, Sequelize)

router.get('/', function (req, res, next) {
    db.Tank.findAll({}).then(tanks => {
        console.log('tanks', tanks);
        res.status(200).send(tanks);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.get('/:id', function (req, res, next) {
    const id = req.params.id;
    db.Tank.findOne({where: {id: id}}).then(tank => {
        console.log('tank', tank);
        res.status(200).send(tank);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.post('/', function (req, res, next) {
    const tank = req.body;
    db.Tank.create({
        name: tank.name,
        siteID: tank.siteID,
    }, {
        fields: ['name', 'siteID']
    }).then(async data => {
        res.status(200).json({message: "new tank created: " + data.dataValues.name, tank: data.dataValues, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });

})

router.put('/:id', async function (req, res, next) {
    const tank = req.body;
    const id = req.params.id;
    await db.Tank.update({
        name: tank.name,
        qtyAlmt09AM: tank.qtyAlmt09AM,
        qtyAlmt12AM: tank.qtyAlmt12AM,
        quantity: tank.quantity,
        qtyAlmt03AM: tank.qtyAlmt03AM,
        cumulAlmt: tank.cumulAlmt,
        nbMale: tank.nbMale,
        nbFemale: tank.nbFemale,
        temp06AM: tank.temp06AM,
        temp03PM: tank.temp03PM,
        oxyg03PM: tank.oxyg03PM,
        oxyg06AM: tank.oxyg06AM,
        nh3: tank.nh3,
        nh2: tank.nh2,
        ph: tank.ph,
        remark: tank.remark,
        date: tank.date,
        siteID: tank.siteID
    }, {
        where: {
            id: id
        }
    }).then((resp) => {
        res.status(200).json({message: "Tank updated: " + req.body.name, tank: tank, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

router.get('/sites/:id', function (req, res, next) {
    const siteId = req.params.id
    db.Tank.findAll({
        where: {siteID: siteId}
    }).then(tanks => {
        console.log('tanks', tanks);
        res.status(200).send(tanks);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});


router.delete('/all', async function (req, res, next) {
    const id = JSON.parse(req.query.ids);
    await db.Tank.destroy({
        where: {
            id: id
        }
    }).then((resp) => {
        res.status(200).json({message: "Tank deleted: " + req.body.name, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

router.get('/nets/all', async function (req, res, next) {
    await sequelize.query(
        'SELECT * FROM nets',
        {
            type: QueryTypes.SELECT
        }
    ).then(nets => {
        console.log('nets', nets);
        res.status(200).send(nets);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.get('/net/:tankID', async function (req, res, next) {
    const tankID = req.params.tankID;
    await sequelize.query(
        'SELECT * FROM nets WHERE tankID IN(:tankID)',
        {
            replacements: { tankID: tankID },
            type: QueryTypes.SELECT
        }
    ).then(net => {
        console.log('nets', net);
        res.status(200).send(net);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.get('/net/:numNet/:idProduct', function (req, res, next) {
    const numNet = req.params.numNet;
    const idProduct = req.params.idProduct;
    db.Net.findOne({where: {numNet: numNet, idProduct: idProduct}}).then(net => {
        console.log('net', net);
        res.status(200).send(net);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.post('/net', function (req, res, next) {
    const net = req.body;
    db.Net.create({
        tankID: net.tankID,
        numNet: net.numNet
    }, {fields: ['numNet', 'tankID']}).then(async data => {
        res.status(200).json({message: "new Net created: H" + data.dataValues.numNet, net: data.dataValues, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

router.put('/net/:numNet', async function (req, res, next) {
    const net = req.body;
    const numNet = req.params.numNet;
    await db.Net.update({idTank: net.idTank}, {
        where: {
            numNet: numNet,
            idProduct: net.idProduct
        }
    }).then((resp) => {
        res.status(200).json({message: "Net updated: " + req.body.numNet, net: net, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

router.delete('/net/all', async function (req, res, next) {
    const numNet = JSON.parse(req.query.ids);
    await db.Net.destroy({
        where: {
            numNet: numNet
        }
    }).then((resp) => {
        res.status(200).json({message: "Net deleted: " + numNet, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

module.exports = router;