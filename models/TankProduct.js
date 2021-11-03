const {Sequelize, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define("tank_product", {
        type: {
            type: Sequelize.STRING
        },
        qtyProduct: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false
    });
}
