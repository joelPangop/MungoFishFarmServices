const express = require('express');
const router = express.Router();
const validatorCredentials = require("validator");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = "secretkey23456";
const userService = require('../services/userservices');
const logService = require('../services/logservices');
const {Sequelize, DataTypes} = require('sequelize');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const db = {};
db.Sequelize = Sequelize;
const sequelize = require('../connection/dbConnection').sequelize

db.Users = require("../models/Users")(sequelize, Sequelize)
db.UserInfos = require("../models/UserInfos")(sequelize, Sequelize)
db.Telephone = require("../models/Telephone")(sequelize, Sequelize)
db.Address = require("../models/Address")(sequelize, Sequelize)
db.Role = require("../models/Roles")(sequelize, Sequelize);
db.ChangeLog = require("../models/ChangeLog")(sequelize, Sequelize);
db.Mail = require("../models/Mail")(sequelize, Sequelize);

const cors = require('cors')
router.use(cors({
    allowedOrigins: [
        '*'
    ]
}));

/* GET users listing. */
router.get('/', function (req, res, next) {
    // res.send('respond with a resource');
    db.Users.findAll({}).then(users => {
        console.log('Users', users);
        res.status(200).send(users);
    })
});

router.get('/userinfos', function (req, res, next) {
    // res.send('respond with a resource');
    db.UserInfos.findAll({}).then(userInfos => {
        console.log('UserInfos', userInfos);
        res.status(200).send(userInfos);
    })
});

router.get('/address', function (req, res, next) {
    // res.send('respond with a resource');
    db.Address.findAll({}).then(addresses => {
        console.log('addresses', addresses);
        res.status(200).send(addresses);
    })
});

router.get('/telephone', function (req, res, next) {
    // res.send('respond with a resource');
    db.Telephone.findAll({}).then(telephones => {
        console.log('telephones', telephones);
        res.status(200).send(telephones);
    })
});

router.get('/roles', function (req, res, next) {
    // res.send('respond with a resource');
    db.Role.findAll({}).then(roles => {
        console.log('roles', roles);
        res.status(200).send(roles);
    })
});


router.get('/:id', function (req, res, next) {
    const id = req.params.id;
    db.Users.findOne({where: {id: id}}).then(user => {
        console.log('User', user);
        res.status(200).send(user);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.get('/userinfos/:id', function (req, res, next) {
    const id = req.params.id;
    db.UserInfos.findOne({where: {id: id}}).then(userInfos => {
        console.log('userInfos', userInfos);
        res.status(200).send(userInfos);
    }).catch(err => {
        console.log(err);
        res.status(501).send(err);
    });
});

router.post('/login', function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    let val = validatorCredentials.isEmail(email);
    let promise = db.Users.findOne({where: {email: email}});
    const ipAddress = req.ip;
    if (val) {
        promise.then(function (doc) {
            if (doc) {
                userService.authenticate({email, password, ipAddress})
                    .then(({jwtToken, refreshToken, ...user}) => {
                        setTokenCookie(res, refreshToken);
                        res.status(200).send({user: user, refreshToken: refreshToken, accessToken: jwtToken});
                    })
                    .catch(next);
            } else {
                return res.status(402).json({message: 'Email ' + email + ' does not exist in our database!'});
            }
        })
    }
})

function setTokenCookie(res, token) {
    // create http only cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}

router.post('/register', async (req, res) => {
    let telephones = req.body.telephones;
    let address = req.body.address;
    let userInfos = req.body.userInfos;
    let user = req.body.user;

    if (!userInfos.id) {
        await db.UserInfos.create({
            firstName: userInfos.firstName,
            lastName: userInfos.lastName,
            gender: userInfos.gender,
            birthday: userInfos.birthday,
        }, {fields: ['firstName', 'lastName', 'gender', 'birthday']}).then(async data => {
            await db.ChangeLog.create({
                user: req.body.username,
                entity: "user_infos",
                operation: "CREATE",
                dateTime: Date.now(),
                data: JSON.stringify(userInfos)
            }, {fields: ['user', 'entity', 'operation', 'dateTime', 'data']}).then(async (res) => {
                console.log(res)
                for (let telephone of telephones) {
                    await createTelephone(req, telephone, data.dataValues.id, res)
                }
                await createAddress(address, data.dataValues.id, res)
                const response = await register(user, data.dataValues.id, res)
                res.status(200).send(response);
            })

        }).catch((e) => {
            console.log(e);
            res.status(501).send({message: err.message, status: "Failed"});
        })
    }
});

async function register(user, userInfosID, res) {
    const email = user.email;

    let val = validatorCredentials.isEmail(email);
    if (val) {
        db.Users.findOne({where: {email: email}}).then(async (resp) => {
            if (!resp) {
                await db.Users.create({
                    userName: user.userName,
                    email: user.email,
                    password: user.password,
                    userInfoID: userInfosID,
                    roleID: user.roleID,
                    supervisorID: user.supervisorID
                }, {fields: ['userName', 'email', 'password', 'userInfoID', 'roleID', 'supervisorID']}).then(async data => {
                    const mail = {};
                    mail.to = user.email;
                    mail.from = 'joelpangop@mungofishfarm.net';
                    mail.subject = "Profile created";
                    mail.text = "Your profile has been created successfully. \n Your password is Abc123...";

                    await send_confirm_mail(mail).then((res) => {
                        console.log(res);
                    });

                    const expiresIn = 24 * 60 * 60;
                    const accessToken = userService.getRefreshTokens(data.dataValues.id)
                    let authResponse = {
                        id: data.dataValues.id,
                        username: data.dataValues.username,
                        email: data.dataValues.email,
                        access_token: accessToken,
                        expires_in: expiresIn
                    }
                    await db.ChangeLog.create({
                        user: user.username,
                        entity: "users",
                        operation: "CREATE",
                        dateTime: Date.now(),
                        data: JSON.stringify(user)
                    }, {fields: ['user', 'entity', 'operation', 'dateTime', 'data']}).then(async (res) => {
                        return {
                            message: "new site created: " + data.dataValues.username,
                            status: "Success",
                            user: authResponse
                        };
                    })
                }).catch(err => {
                    console.log(err);
                    return err;
                });
            } else {
                return 'Email already exists in our database!';
            }

        }).catch(err => {
            console.log(err);
            return err;
        });

    } else {
        return 'Invalid email!';
    }
}

async function createTelephone(req, telephone, userInfosID, res) {

    await db.Telephone.create({
        telephone_number: telephone.telephone_number,
        telephone_category: telephone.telephone_category,
        userInfosID: userInfosID
    }, {fields: ['telephone_number', 'telephone_category', 'userInfosID']}).then(async (tel) => {
        await db.ChangeLog.create({
            user: req.body.username,
            entity: "telephones",
            operation: "CREATE",
            dateTime: Date.now(),
            data: JSON.stringify(telephone)
        }, {fields: ['user', 'entity', 'operation', 'dateTime', 'data']}).then(async (res) => {
            console.log(tel.dataValues.telephone_number + " created")
        })

    }).catch((err) => {
        console.log(err);
    })

}

async function createAddress(address, userInfosID, res) {
    if (!address.id) {
        await db.Address.create({
            addr_1: address.addr_1,
            addr_2: address.addr_2,
            appart_num: address.appart_num,
            town: address.town,
            country: address.country,
            region: address.region,
            postal_code: address.postal_code,
            userInfosID: userInfosID
        }, {fields: ['addr_1', 'addr_2', 'appart_num', 'town', 'country', 'region', 'postal_code', 'userInfosID']}).then(async (addr) => {
            // await db.ChangeLog.create({
            //     user: req.body.user.username,
            //     entity: "addresses",
            //     operation: "CREATE",
            //     dateTime: Date.now(),
            //     data: JSON.stringify(address)
            // }, {fields: ['user', 'entity', 'operation', 'dateTime', 'data']}).then(async (res) => {
            //     console.log(addr.dataValues.addr_1 + " created")
            // })
            console.log(addr.dataValues.addr_1 + " created")
        })
    } else {
        res.status(501).send({message: err.message, status: "Failed"});
    }
}

router.put('/update/:id', async (req, res) => {
    const id = req.params.id;
    let telephones = req.body.telephones;
    let address = req.body.address;
    console.log(req.body);
    let promise = db.Users.findOne({where: {id: id}});

    await db.Users.update({
        userName: req.body.user.userName,
        email: req.body.user.email,
        password: req.body.user.password,
        userInfoID: req.body.user.userInfoID,
        roleID: req.body.user.roleID,
        supervisorID: req.body.user.supervisorID
    }, {
        where: {
            id: id
        }
    }).then(async (resp) => {
        console.log('userInfos', req.body.userInfos);
        await db.UserInfos.update({
            firstName: req.body.userInfos.firstName,
            lastName: req.body.userInfos.lastName,
            gender: req.body.userInfos.gender,
            birthday: req.body.userInfos.birthday
        }, {
            where: {
                id: req.body.user.userInfoID
            }
        }).then(async (userInfo) => {
            console.log(userInfo);


            promise.catch(function (err) {
                return res.status(501).json({result: 'failed', message: 'Some internal error'});
            })

            db.Address.findOne({where: {userInfosID: req.body.user.userInfoID}}).then(async (resp) => {
                if (!resp) {
                    await createAddress(req.body.address, req.body.user.userInfoID, res)
                } else {
                    await updateAddress(req, resp.dataValues.id);
                }
                // console.log('userInfos', userInfos);
                // res.status(200).send(userInfos);
            }).catch(err => {
                console.log(err);
                res.status(501).send(err);
            });

            for (let telephone of telephones) {
                const id = telephone.id ? telephone.id : -1;
                db.Telephone.findOne({where: {id: id}}).then(async (resp) => {
                    if (!resp) {
                        await createTelephone(req, telephone, req.body.user.userInfoID, res)
                    } else {
                        await updateTelephone(req, resp.dataValues, id, req.body.user.userInfoID);
                    }
                }).catch(err => {
                    console.log(err);
                });
            }

        }).catch(err => {
            console.log(err);
            res.status(501).send(err);
        });

        logService.generateDelta("users", req.body.user);
        await db.ChangeLog.create({
            user: req.body.username,
            entity: "users",
            operation: "UPDATE",
            dateTime: Date.now(),
            data: JSON.stringify(req.body.user)
        }, {fields: ['user', 'entity', 'operation', 'dateTime', 'data']}).then(async (response) => {
            console.log(response);

            res.status(200).send({result: 'Success', message: "User updated"});
        })

    }).catch(err => {
        console.log(err);
        res.status(402).json({result: 'failed', message: 'User not found'});
    });

})

router.put('/update/password/:id', async (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    let promise = db.Users.findOne({where: {id: id}});
    promise.then(async function (doc) {
        if (doc) {
            let user = new User(doc);
            user.userInfo = req.body.userInfo;
            user.password = bcrypt.hashSync(req.body.password, 8);
            await user.save();
            user.password = '';
            res.status(200).send({result: 'success', user: user});
        } else {
            return res.status(402).json({message: 'User not found'});
        }
    })
    promise.catch(function (err) {
        return res.status(501).json({result: 'failed', message: 'Some internal error'});
    })
});

async function updateAddress(req, id) {
    if (id) {
        // const id = req.body.address.id;
        console.log(req.body);
        let promise = db.Address.findOne({where: {id: id}});

        promise.catch(function (err) {
            return res.status(501).json({result: 'failed', message: 'Some internal error'});
        })

        await db.Address.update({
            addr_1: req.body.address.addr_1,
            addr_2: req.body.address.addr_2,
            appart_num: req.body.address.appart_num,
            town: req.body.address.town,
            country: req.body.address.country,
            region: req.body.address.region,
            postal_code: req.body.address.postal_code,
            userInfosID: req.body.userInfos.id
        }, {
            where: {
                id: id
            }
        }).then(async (resp) => {
            await db.ChangeLog.create({
                user: req.body.username,
                entity: "addresses",
                operation: "UPDATE",
                dateTime: Date.now(),
                data: JSON.stringify(req.body.address)
            }, {fields: ['user', 'entity', 'operation', 'dateTime', 'data']}).then(async (res) => {
                return {result: 'success', address: resp};
            })
        })
    }
}

async function updateTelephone(req, telephone, id, userInfosID) {
    // const id = telephone.id;
    await db.Telephone.update({
        telephone_number: telephone.telephone_number,
        telephone_category: telephone.telephone_category,
        userInfosID: userInfosID
    }, {
        where: {
            id: telephone.id
        }
    }).then(async (resp) => {
        await db.ChangeLog.create({
            user: req.body.username,
            entity: "telephones",
            operation: "UPDATE",
            dateTime: Date.now(),
            data: JSON.stringify(telephone)
        }, {fields: ['user', 'entity', 'operation', 'dateTime', 'data']}).then(async (res) => {
            return {result: 'success', telephone: resp};
        })

    })

}

router.delete('/telephone/:id', async (req, res) => {
    const id = req.params.id;
    await db.Telephone.destroy({
        where: {
            id: id
        }
    }).then((resp) => {
        res.status(200).json({message: "Telephone deleted", status: "Success"});
    }).catch(err => {
        console.log(err);
        res.status(501).send({message: err.message, status: "Failed"});
    });
})

async function send_confirm_mail(mail) {
    // const mail = {};
    // mail.to = req.body.to;
    // mail.from = 'joelpangop@mungofishfarm.net';
    // mail.subject = req.body.subject;
    // mail.text = req.body.text;
    console.log('mail', mail);

    const transporter = nodemailer.createTransport(smtpTransport({
        name: 'hostgator',
        host: 'gator3231.hostgator.com',
        secure: true,
        port: 465,
        auth: {
            user: 'joelpangop@mungofishfarm.net',
            pass: 'Jojo0689'
        }
    }));

    const mailOptions = {
        from: mail.from,
        to: mail.to,
        subject: mail.subject,
        text: mail.text
    };

    await transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
            console.log(error);
            return "Not found";
        } else {
            console.log('Email sent: ' + info.response);
            await db.Mail.create({
                from: mail.from,
                to: mail.to,
                subject: mail.subject,
                text: mail.text
            }, {fields: ['from', 'to', 'subject', 'text']}).then(async (resp) => {
                return resp.dataValues;
                // res.status(200).json(resp.dataValues);
            })
        }
    });

}

module.exports = router;
