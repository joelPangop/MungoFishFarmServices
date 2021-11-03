const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {
    return sequelize.define("roles", {
        roleName: {
            type: Sequelize.STRING
        },
    }, {
        timestamps: false
    });
}