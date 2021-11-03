const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {
    db.Tank = require("../models/Tank")(sequelize, Sequelize)
    const Net = sequelize.define("net", {
        numNet: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false
    });

    db.Tank.hasMany(Net, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', foreignKey: 'tankID'
    });
    Net.belongsTo(db.Tank, {
        constraints: false,
        timestamps: false, foreignKey: 'tankID'
    });

    return Net;
}
