const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {

    return sequelize.define("user_infos", {
        firstName: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        gender: {
            type: Sequelize.STRING
        },
        birthday: {
            type: DataTypes.DATE,
            validate: {
                isDate: true
            }
        }
    }, {
        timestamps: false
    });
}
