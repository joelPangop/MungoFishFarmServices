const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {
    db.UserInfos = require("../models/UserInfos")(sequelize, Sequelize)
    const Address = sequelize.define("addresses", {
        addr_1: {
            type: Sequelize.STRING
        },
        addr_2: {
            type: Sequelize.STRING
        },
        appart_num: {
            type: DataTypes.INTEGER
        },
        town: {
            type: Sequelize.STRING
        },
        country: {
            type: Sequelize.STRING
        },
        region: {
            type: Sequelize.STRING
        },
        postal_code: {
            type: Sequelize.STRING
        },
    }, {
        timestamps: false
    });

    db.UserInfos.hasMany(Address, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', onUpdate: 'CASCADE', foreignKey: 'userInfosID'
    });
    Address.belongsTo(db.UserInfos, {
        constraints: false,
        timestamps: false, foreignKey: 'userInfosID'
    });

    return Address;
}
