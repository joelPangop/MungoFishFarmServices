const {Sequelize, DataTypes} = require('sequelize');
const db = {};
const bcrypt = require("bcryptjs")
db.Sequelize = Sequelize;
const config = require('../config.json');

module.exports = (sequelize) => {
    db.UserInfos = require("../models/UserInfos")(sequelize, Sequelize)
    db.Roles = require("../models/Roles")(sequelize, Sequelize)
    const User = sequelize.define("users", {
        userName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING
        }
    }, {
        hooks: {
            beforeCreate: async (users) => {
                if (users.password) {
                    const salt = await bcrypt.genSaltSync(10, config.secret);
                    users.password = bcrypt.hashSync(users.password, salt);
                }
            },
            beforeUpdate: async (users) => {
                if (users.password) {
                    const salt = await bcrypt.genSaltSync(10, config.secret);
                    users.password = bcrypt.hashSync(users.password, salt);
                }
            },
            afterFind: async (users ) => {
               console.log(users);
            }
        },
        instanceMethods: {
            validPassword: (password) => {
                return bcrypt.compareSync(password, this.password);
            }
        }
    }, {
        timestamps: false
    });

    db.UserInfos.hasMany(User, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', foreignKey: 'userInfoID'
    });
    User.belongsTo(db.UserInfos, {
        constraints: false,
        timestamps: false, foreignKey: 'userInfoID'
    });

    db.Roles.hasMany(User, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', foreignKey: 'roleID'
    });
    User.belongsTo(db.Roles, {
        constraints: false,
        timestamps: false, foreignKey: 'roleID'
    });

    User.hasMany(User, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE',
        foreignKey: 'supervisorID'
    });

    User.belongsTo(User, {
        constraints: false,
        timestamps: false, foreignKey: 'supervisorID'
    });

    User.prototype.validPassword = async (password, hash) => {
        return await bcrypt.compareSync(password, hash);
    }

    return User;
}
