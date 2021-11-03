const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {
    const Device = sequelize.define("devices", {
        appBuild: {
            type: Sequelize.STRING
        },
        uuid: {
            type: Sequelize.STRING,
            validate: {
                isUUID: 4
            }
        },
        appId: {
            type: Sequelize.STRING
        },
        appName: {
            type: Sequelize.STRING
        },
        appVersion: {
            type: Sequelize.STRING
        },
        isVirtual: {
            type: DataTypes.BOOLEAN
        },
        manufacturer: {
            type: Sequelize.STRING
        },
        model: {
            type: Sequelize.STRING
        },
        operatingSystem: {
            type: Sequelize.STRING
        },
        osVersion: {
            type: Sequelize.STRING
        },
        platform: {
            type: Sequelize.STRING
        },
        userInfosID: {
            type: DataTypes.INTEGER
        }
    })
    return Device;
}
