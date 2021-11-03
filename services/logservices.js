const {Sequelize, DataTypes} = require('sequelize');
const db = {};
db.Sequelize = Sequelize;
const sequelize = require('../connection/dbConnection').sequelize

db.ChangeLog = require("../models/ChangeLog")(sequelize, Sequelize);

function generateDelta(entity, data){
    db.ChangeLog.findAll({where: {entity: entity}}).then(log => {
        console.log('Log', log);
        let map1 = new Map(Object.entries(JSON.parse(log[0].data)));
        let map2 = new Map(Object.entries(data));

        let test = compareMaps(map1, map2);
        console.log(test);
    }).catch(err => {
        console.log(err);
    });
}

function compareMaps(map1, map2) {
    let testVal;
    let map = new Map();
    if (map1.size !== map2.size) {
        return false;
    }
    for (const [key, val] of map1) {
        testVal = map2.get(key);
        // in cases of an undefined value, make sure the key
        // actually exists on the object so there are no false positives
        if (testVal !== val || (testVal === undefined && !map2.has(key))) {
            // return false;
            map.set(key, {oldValue : val, newValue: testVal})
        }
    }
    return map;
}

module.exports = {
    generateDelta
}