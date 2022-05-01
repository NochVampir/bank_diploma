const { Op } = require("sequelize");
const {User} = require("./entities/account");
const bcrypt = require("bcrypt");
const {Transaction} = require("./entities/transaction");
const {getMoneyObj} = require("./utils");
const {db} = require("./db");
const passport = require("passport");
const jwt = require('jsonwebtoken');

module.exports.initRoutes = (app) => {
    app.post("/account/login", async (req, res) => {
        passport.authenticate('local', {session: false}, (err, user, info) => {
            if(err || !user){
                return res
                    .status(404)
                    .send({
                        msg: err?.msg || info?.message
                    })
            }

            req.login(user, {session: false}, (err) => {
                if(err){
                    res
                        .status(500)
                        .send(err)
                }


                const token = jwt.sign({
                    id: user.id
                }, 'secret')
                res.send({
                    token
                })
            })
        })(req, res)
    })


    app.post("/account", async (req, res) => {
        const payload = req.body;

        try{
            const hashPassword = await bcrypt.hash(payload.password, 10)
            const user = await User.create({
                ...payload,
                password: hashPassword
            })
            res
                .send({
                    dbUser: user
                })
        }catch (e) {
            res
                .status(400)
                .send({
                    error: e.parent?.detail ?? e
                })
        }
    })

    app.get("/account/find", passport.authenticate("jwt", {session: false}), async (req, res) => {
        const {q} = req.query

        if(!q) return res.send({
            data: []
        })

        const usersList = await User.findAll({
            where: {
                nickname: {
                    [Op.like]: `%${q}%`
                }
            },
            attributes: {
                exclude: ["password", "amount"]
            }
        })

        res.send({
            data: usersList
        })

    })

    app.post("/transactions", passport.authenticate("jwt", {session: false}), async (req, res) => {
        const payload = req.body
        const t = await db.transaction();

        try{
            const senderUser = await User.findByPk(payload.senderId)
            if(req.user.id !== senderUser?.id){
                res
                    .status(403)
                    .send({
                        error: "Not your account"
                    })

            }
            if (payload.cost > senderUser.amount){
                res
                    .status(500)
                    .send({
                        error: "Not enough money"
                    })
                return
            }

            const transaction = await Transaction.create({
                cost: payload.cost
            })
            transaction.setSender(req.body.senderId)
            transaction.setRecipient(req.body.recipientId)

            const transactionMoney = getMoneyObj(+payload.cost)
            const senderMoney = getMoneyObj(+senderUser.amount)

            await User.update({ amount: senderMoney.add(getMoneyObj(-payload.cost)).getAmount() }, {
                where: {
                    id: payload.senderId
                }
            });

            const recipeUser = await User.findByPk(payload.recipientId)
            const recipeMoney = getMoneyObj(+recipeUser.amount)
            await User.update({ amount: recipeMoney.add(transactionMoney).getAmount()}, {
                where: {
                    id: payload.recipientId
                }
            })

            await t.commit()
            res.send({
                data: transaction
            })
        }catch (e) {
            await t.rollback()
            console.log(e)
        }
    })

    app.get("/transactions/:id", passport.authenticate("jwt", {session: false}), async (req, res) => {
        const transactionId = req.params.id

        try {
            const transaction = await Transaction.findByPk(transactionId, {
                include: [
                    {
                        as: 'recipient',
                        model: User
                    },
                    {
                        as: 'sender',
                        model: User
                    }
                ]
            })

            res.send({
                data: transaction
            })
        }catch (e) {
            console.log(e)
        }
    })

    app.get("/transactions/:userId/list", passport.authenticate("jwt", {session: false}), async (req, res) => {
        const userId = req.params.userId
        try{
            const userTransactions =  await Transaction.findAll({
                where: {
                    [Op.or]: [
                        { senderId: userId},
                        { recipientId: userId }
                    ]
                },
            })
            res.send({
                data: userTransactions})
        }catch (e){
            console.log(e)
        }
    })

}