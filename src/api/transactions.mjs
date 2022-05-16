import passport from "passport";
import {db} from "../db.mjs";
import {User} from "../entities/account.mjs";
import {Transaction} from "../entities/transaction.mjs";
import {getMoneyObj} from "../utils.mjs";
import {Op} from "sequelize";
import express from "express";

const router = express.Router();

router.post("/", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const payload = req.body
    const isDisabled = req.query.isDisabled;
    const t = isDisabled ? undefined : await db.transaction();

    try{
        const senderUser = await User.findByPk(payload.senderId, {
            lock: t?.LOCK.UPDATE,
            transaction: t
        })
        if(!senderUser){
            throw Error
        }
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
        }, {
            transaction: t
        })
        transaction.setSender(req.body.senderId)
        transaction.setRecipient(req.body.recipientId)

        const transactionMoney = getMoneyObj(+payload.cost)
        const senderMoney = getMoneyObj(+senderUser.amount)

        await User.update({ amount: senderMoney.add(getMoneyObj(-payload.cost)).getAmount() }, {
            where: {
                id: payload.senderId
            },
            transaction: t
        });

        const recipeUser = await User.findByPk(payload.recipientId, {
            lock: t?.LOCK.UPDATE,
            transaction: t
        })
        if(!recipeUser) throw Error
        const recipeMoney = getMoneyObj(+recipeUser.amount)
        await User.update({ amount: recipeMoney.add(transactionMoney).getAmount()}, {
            where: {
                id: payload.recipientId
            },
            transaction: t
        })

        await t?.commit()
        res.send({
            data: transaction
        })
    }catch (e) {
        await t?.rollback()
        res
            .status(500)
            .send({})
    }
})

router.get("/:id", passport.authenticate("jwt", {session: false}), async (req, res) => {
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

router.get("/:userId/list", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const userId = req.params.userId
    const sortName = req.query.sortName || 'createdAt'
    const sortDir = req.query.sortDir || 'ASC'

    if(req.user.id !== parseInt(userId, 10)){
        return res
            .status(403)
            .send({
                error: "Not your account"
            })
    }

    try{
        const userTransactions =  await Transaction.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId},
                    { recipientId: userId }
                ]
            },
            order: [
                [sortName, sortDir]
            ],
            include: [
                {
                    as: 'sender',
                    model: User,
                    attributes: ["id", "nickname"]
                },
                {
                    as: 'recipient',
                    model: User,
                    attributes: ["id", "nickname"]
                }
            ],
        })
        res.send(userTransactions)
    }catch (e){
        console.log(e)
    }
})

export default router;
