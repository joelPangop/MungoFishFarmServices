const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {
    const ChangeLog = sequelize.define("change_log", {
        user: {
            type: Sequelize.STRING
        },
        entity: {
            type: Sequelize.STRING
        },
        operation: {
            type: Sequelize.STRING
        },
        dateTime: {
            type: DataTypes.DATE
        },
        data: {
            type: Sequelize.STRING
        },
        delta: {
            type: Sequelize.STRING
        }
    })
    return ChangeLog;
}