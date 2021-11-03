module.exports = (sequelize, Sequelize) => {
    return sequelize.define("site", {
        name: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });
}
