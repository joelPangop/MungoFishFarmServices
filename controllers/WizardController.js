const SiteEnum = require("../models/SiteEnum");
const RoleEnum = require("../models/RoleEnum");
const {Sequelize} = require('sequelize');

const bt_tank_arr = ['BT01', 'BT02', 'BT03', 'BT04']
const catF_tank_arr = ['CT01', 'CT02', 'CT03', 'CT04', 'CT05', 'CT06']
const tb_tank_arr = ['CT07', 'CT08', 'CT09', 'CT10', 'CT11', 'CT12']

async function createTank(db, resultset, tank_arr) {

    for (let tank_name of tank_arr) {
        db.Tank.findOne({
            where: {
                name: tank_name
            },
            include: [
                {
                    model: db.Site, as: db.Site.id,
                    where: {
                        name: resultset.dataValues.name
                    }
                }
            ]
        }).then(async tank => {
            console.log(tank)
            if (tank === null) {
                await db.Tank.create({
                    name: tank_name,
                    siteID: resultset.dataValues.id
                }, {fields: ['name', 'siteID']}).then((res) => {
                    console.log("new tank created", res.dataValues.name)
                })
            }
        }).catch((err) => {
            console.log(err)
        })
    }

}

module.exports = {
    runWizard: async function run(sequelize) {
        const db = {};
        db.Sequelize = Sequelize;
        db.Site = require("../models/Site")(sequelize, Sequelize);
        db.Tank = require("../models/Tank")(sequelize, Sequelize);
        db.Role = require("../models/Roles")(sequelize, Sequelize);
        db.User = require("../models/Users")(sequelize, Sequelize);
        db.UserInfos = require("../models/UserInfos")(sequelize, Sequelize);
        try {
            console.log('Create if not exists.');
            let i = 1;
            for(let roleName of RoleEnum.RoleArray) {

                await db.Role.findOne({
                    where: {
                        roleName: roleName
                    }
                }).then(async data => {
                    if (data == null) {
                        // i++;
                        console.log("Creation d'un Role")
                        await db.Role.create({
                            id: i,
                            roleName: roleName
                        }, {fields: ['id', 'roleName']}).then(async res => {
                            i++;
                            console.log("Role "+res.roleName+" created");
                        })
                    }

                })
            }

            for (let siteName of SiteEnum.SiteArray) {
                await db.Site.findOne({
                    where: {
                        name: siteName
                    }
                }).then(async data => {
                    console.log(data);
                    if (data == null) {
                        console.log("Creation d'un site")
                        await db.Site.create({
                            name: siteName
                        }, {fields: ['name']}).then(async res => {
                            console.log(res);
                            switch (res.dataValues.name) {
                                case SiteEnum.SiteEnum.TP_BRDSTK:
                                    await createTank(db, res, bt_tank_arr);
                                    break;
                                case SiteEnum.SiteEnum.CATFISH:
                                    await createTank(db, res, catF_tank_arr);
                                    break;
                                case SiteEnum.SiteEnum.TP_BRED:
                                    await createTank(db, res, tb_tank_arr);
                                    break;
                            }
                        });
                    }
                }).catch(err => {
                    console.log(err);
                })
            }

            await db.User.findOne({
                where: {
                    userName: 'joelPangop'
                }
            }).then(async data => {
                if (data == null) {

                    await db.UserInfos.create({
                        firstName : '',
                        lastName: '',
                        gender: '',
                        birthday: Date.now()
                    }, {fields: ['firstName', 'lastName', 'gender', 'birthday']}).then(async res => {

                        console.log("Creation d'un User")
                        await db.User.create({
                            userName: 'joelPangop',
                            email: 'joelpangop@egoal.com',
                            password: 'Abc123...',
                            roleID: 1,
                            userInfoID: res.dataValues.id
                        }, {fields: ['userName', 'email', 'password', 'roleID', 'userInfoID']}).then(async res => {
                            console.log("User "+res.dataValues.userName+" created");
                        })
                    })
                }
            })

        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
}
