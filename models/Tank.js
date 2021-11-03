const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize, Sequelize) => {
    db.Site = require("../models/Site")(sequelize, Sequelize)
    const Tank = sequelize.define("tank", {
        name: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });

    db.Site.hasMany(Tank, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', foreignKey: 'siteID'
    });
    Tank.belongsTo(db.Site, {
        constraints: false,
        timestamps: false, foreignKey: 'siteID'
    });

    return Tank;
}