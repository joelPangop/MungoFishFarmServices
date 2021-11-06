const WizardController = require("../controllers/WizardController");
const {Sequelize} = require('sequelize');
// const sequelize = new Sequelize('mungo_fish_db', 'root', 'Abc123...', {
//     host: 'localhost',
//     port: 3306,
//     dialect: 'mysql',
//     define: {
//         timestamps: false
//     },
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// });

const sequelize = new Sequelize('heroku_3cf8e8c3ba79c52', 'bca46208cd0572', 'de021c8c', {
    host: 'us-cdbr-east-04.cleardb.com',
    port: 3306,
    dialect: 'mysql',
    define: {
        timestamps: false
    }
});

module.exports = {
    connectionDb: async function connection() {
        try {
            await sequelize.authenticate();
            console.log('Connection to the database has been established successfully.');
            await WizardController.runWizard(sequelize);
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    },
    sequelize: sequelize
}
