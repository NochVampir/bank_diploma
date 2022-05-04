const {  DataTypes } = require('sequelize');
const {db} = require("../db");

const User = db.define('User', {
    nickname: {
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
        defaultValue: ''
    }
})

User.sync({alter: true})

module.exports.User = User
