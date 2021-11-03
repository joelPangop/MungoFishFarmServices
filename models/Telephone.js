const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {
    db.UserInfos = require("../models/UserInfos")(sequelize, Sequelize)
    const Telephone = sequelize.define("telephones", {
        telephone_number: {
            type: Sequelize.STRING
        },
        telephone_category: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });

    db.UserInfos.hasMany(Telephone, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', onUpdate: 'CASCADE', foreignKey: 'userInfosID'
    });
    Telephone.belongsTo(db.UserInfos, {
        constraints: false,
        timestamps: false, foreignKey: 'userInfosID'
    });

    return Telephone;
}
