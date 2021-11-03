const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {
    db.Users = require("../models/Users")(sequelize, Sequelize)
    const RefreshToken = sequelize.define("refreshTokens", {
        token: String,
        expires: Date,
        created: { type: Date, default: Date.now },
        createdByIp: String,
        revoked: Date,
        revokedByIp: String,
        replacedByToken: String
    }, {
        timestamps: false
    })
    db.Users.hasOne(RefreshToken, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', foreignKey: 'userID'
    });
    RefreshToken.belongsTo(db.Users, {
        constraints: false,
        timestamps: false, foreignKey: 'userID'
    });
    return RefreshToken;
}

