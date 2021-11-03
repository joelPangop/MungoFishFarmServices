const router = require('express').Router();

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
db.Product = require("../models/TankProduct")(sequelize, Sequelize)

router.get('/', function (req, res, next) {
    db.Product.findAll({}).then(products => {
        console.log('tanks', products);
        res.status(200).send(products);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.get('/:id', function (req, res, next) {
    const id = req.params.id;
    db.Product.findOne({where: {id: id}}).then(products => {
        console.log('tank', products);
        res.status(200).send(products);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.post('/', function (req, res, next) {
    const product = req.body;
    db.Product.create({
        type: product.type,
        qtyProduct: product.qtyProduct
    }, {fields: ['type', 'qtyProduct']}).then(async data => {
        res.status(200).json({message: "new product created: " + data.dataValues.type, status: "Success", product: data.dataValues});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

router.delete('/all', async function (req, res, next) {
    const id = JSON.parse(req.query.ids);
    await db.Product.destroy({
        where: {
            id: id
        }
    }).then((resp) => {
        res.status(200).json({message: "Product deleted: " + req.body.name, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

router.put('/:id', async function (req, res, next) {
    const product = req.body;
    const id = req.params.id;
    await db.Product.update({type: product.type, qtyProduct: product.qtyProduct}, {
        where: {
            id: id
        }
    }).then((resp) => {
        res.status(200).json({message: "Product updated: " + req.body.name, product: product, status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

router.put('/by_type/:type', async function (req, res, next) {
    const product = req.body;
    const type = req.params.type;
    await db.Product.update({qtyProduct: product.qtyProduct}, {
        where: {
            type: type
        }
    }).then((resp) => {
        res.status(200).json({message: "Product updated: " + req.body.type});
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
})

module.exports = router;