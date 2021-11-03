const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {
    return sequelize.define("mail", {
        to: {
            type: Sequelize.STRING
        },
        from: {
            type: Sequelize.STRING
        },
        subject: {
            type: Sequelize.STRING
        },
        text: {
            type: Sequelize.STRING
        }
    });
}
