const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize, Sequelize) => {
    db.Tank = require("../models/Tank")(sequelize, Sequelize)
    db.Product = require("../models/TankProduct")(sequelize, Sequelize)
    const DailyFeedback = sequelize.define("daily_feedbacks", {
        qtyAlmt09AM: {
            type: DataTypes.INTEGER
        },
        qtyAlmt12PM: {
            type: DataTypes.INTEGER
        },
        qtyAlmt03PM: {
            type: DataTypes.INTEGER
        },
        quantity: {
            type: DataTypes.INTEGER
        },
        cumulAlmt: {
            type: DataTypes.INTEGER
        },
        nbMale: {
            type: DataTypes.INTEGER
        },
        nbFemale: {
            type: DataTypes.INTEGER
        },
        temp06AM: {
            type: DataTypes.INTEGER
        },
        temp03PM: {
            type: Sequelize.FLOAT
        },
        oxyg03PM: {
            type: Sequelize.FLOAT
        },
        oxyg06AM: {
            type: Sequelize.FLOAT
        },
        nh3: {
            type: Sequelize.FLOAT
        },
        nh2: {
            type: Sequelize.FLOAT
        },
        ph: {
            type: Sequelize.FLOAT
        },
        remark: {
            type: Sequelize.STRING
        },
        date: {
            type: DataTypes.DATE
        },
        submitted: {
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: false
    });

    db.Tank.hasMany(DailyFeedback, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', foreignKey: 'tankID'
    });

    DailyFeedback.belongsTo(db.Tank, {
        constraints: false,
        timestamps: false, foreignKey: 'tankID'
    });

    db.Product.hasMany(DailyFeedback, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', foreignKey: 'productID'
    });

    DailyFeedback.belongsTo(db.Product, {
        constraints: false,
        timestamps: false, foreignKey: 'productID'
    });

    return DailyFeedback;
}
