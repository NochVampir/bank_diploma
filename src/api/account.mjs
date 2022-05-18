import passport from "passport";
import {User} from "../entities/account.mjs";
import jwtDecode from "jwt-decode";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import bcrypt from "bcrypt";
import {uid} from "uid";
import {Op} from "sequelize";
import {getMoneyObj} from "../utils.mjs";
import {Transaction} from "../entities/transaction.mjs";
import express from "express";
import {accountMapper} from "../mappers/accountMapper.js";

const router = express.Router();

router.post("/logout", passport.authenticate("jwt", {session: false}), async (req, res) => {
    if(req.user?.id){
        await User.update({
            refresh: ''
        }, {
            where: {
                id: req.user.id
            }
        })

        res.send({})
    }
})

router.get("/refresh", async (req, res) => {
    const {
        refreshToken
    } = req.cookies;

    try{
        const decoded = jwtDecode(refreshToken)
        const userDetails = await User.findByPk(decoded.id)

        if(userDetails.refresh === refreshToken && await jwt.verify(refreshToken, 'secret')){
            const token = jwt.sign({
                id: decoded.id
            }, 'secret', {
                expiresIn: '15min'
            })
            const refreshToken = jwt.sign({
                id: decoded.id
            }, 'secret', {
                expiresIn: '30days'
            })

            await User.update({
                refresh: refreshToken
            }, {
                where: {
                    id: decoded.id
                }
            })

            res.cookie("refreshToken", refreshToken, {
                secure: process.env.NODE_ENV !== "development",
                httpOnly: true,
                expires: dayjs().add(30, "days").toDate()
            })
            return res.send({
                accessToken: token
            })
        }
    }catch (e) {
        return res
            .status(401)
            .send({})
    }

    res
        .status(401)
        .send({})
})

router.get("/findByOperationNumber", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const {operationNumber} = req.query

    try{
        const user = await User.findOne({
            where: {
                operationNumber
            },
            attributes: ["id"]
        })

        res.send(user)
    }catch (e) {
        console.log(e)
    }
})

router.post("/login", async (req, res) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if(err || !user){
            return res
                .status(404)
                .send({
                    msg: err?.msg || info?.message
                })
        }

        req.login(user, {session: false}, async (err) => {
            if(err){
                res
                    .status(500)
                    .send(err)
            }


            const token = jwt.sign({
                id: user.id
            }, 'secret', {
                expiresIn: '15min'
            })
            const refreshToken = jwt.sign({
                id: user.id
            }, 'secret', {
                expiresIn: '30days'
            })
            await User.update({
                refresh: refreshToken
            },{
                where: {
                    id: user.id
                }
            })
            res.cookie("refreshToken", refreshToken, {
                secure: process.env.NODE_ENV !== "development",
                httpOnly: true,
                expires: dayjs().add(30, "days").toDate()
            })
            res.send({
                token,
            })
        })
    })(req, res)
})


router.post("/", async (req, res) => {
    const payload = req.body;

    try{
        const hashPassword = await bcrypt.hash(payload.password, 10)
        const user = await User.create({
            ...payload,
            operationNumber: uid(12),
            password: hashPassword
        })
        res
            .send(accountMapper(user))
    }catch (e) {
        res
            .status(400)
            .send({
                error: e.parent?.detail ?? e
            })
    }
})

router.get("/find", passport.authenticate("jwt", {session: false}), async (req, res) => {
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
            exclude: ["password", "refresh"]
        }
    })

    res.send(usersList.map(user => accountMapper(user)))

})

router.get("/details", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const userDetails = await User.findByPk(req.user.id, {
        attributes: {
            exclude: ["password", "refresh"]
        }
    })

    res.send(accountMapper(userDetails))
})

router.get("/last-activity", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const userId = req.user.id

    try{
        const operations = await Transaction.findAll({
            where: {
                [Op.or]: [
                    {senderId: userId},
                    {recipientId: userId},
                ]
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 6
        })

        res.send(operations.map(operation => ({
            type: operation.senderId === userId ? 'increase' : 'decrease',
            value: operation.cost,
        })))
    }catch (e) {
        console.log(e)
        res.send(500)
    }
})

router.put("/replenishment/", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const cost = getMoneyObj(req.body.cost)
    try {
        const user = await User.findByPk(req.user.id)
        const userAmount = getMoneyObj(+user.amount)
        await User.update({amount: userAmount.add(cost).getAmount()}, {
            where: {
                id: req.user.id
            }
        });
        res.send({})
    }
    catch(e){
        console.log(e);
    }
})

export default router;
