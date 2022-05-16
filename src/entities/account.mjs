import {db} from '../db.mjs'
import {DataTypes} from "sequelize";

export const User = db.define('User', {
    nickname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    operationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.STRING,
        defaultValue: "0"
    },
    refresh: {
        type: DataTypes.STRING,
    }
})

User.sync({alter: true})
