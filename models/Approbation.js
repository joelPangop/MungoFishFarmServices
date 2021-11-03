const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;

module.exports = (sequelize) => {
    db.User = require("../models/Users")(sequelize, Sequelize);
    db.DailyFeedbacks = require("../models/DailyFeedback")(sequelize, Sequelize);
    const Approbation = sequelize.define("approbation", {
        daily_feedbackID: {
            type: Sequelize.STRING
        },
        userID: {
            type: DataTypes.INTEGER
        },
        supervisorID: {
            type: DataTypes.INTEGER
        },
        status: {
            type: Sequelize.STRING
        },
        createdAt: {
            type: DataTypes.DATE
        },
        approvedAt: {
            type: DataTypes.DATE
        },
        rejectedAt: {
            type: DataTypes.DATE
        },
    }, {
        timestamps: false
    });

    db.User.hasMany(Approbation, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', onUpdate: 'CASCADE', foreignKey: 'userID'
    });
    Approbation.belongsTo(db.User, {
        constraints: false,
        timestamps: false, foreignKey: 'userID'
    });

    db.User.hasMany(Approbation, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', onUpdate: 'CASCADE', foreignKey: 'supervisorID'
    });
    Approbation.belongsTo(db.User, {
        constraints: false,
        timestamps: false, foreignKey: 'supervisorID'
    });

    db.DailyFeedbacks.hasMany(Approbation, {
        constraints: false,
        timestamps: false, onDelete: 'CASCADE', onUpdate: 'CASCADE', foreignKey: 'daily_feedbackID'
    });
    Approbation.belongsTo(db.DailyFeedbacks, {
        constraints: false,
        timestamps: false, foreignKey: 'daily_feedbackID'
    });

    return Approbation;
}
