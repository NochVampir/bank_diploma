const {  DataTypes } = require('sequelize');
const {db} = require("../db");
const {User} = require("./account");

const Transaction = db.define('Transaction',{
    cost: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    }
})

Transaction.belongsTo(User, {
    as: 'sender'
})
Transaction.belongsTo(User, {
    as: 'recipient'
})
User.hasMany(Transaction, {
    as: 'sendTransactions'
})
User.hasMany(Transaction, {
    as: 'receivedTransactions'
})
Transaction.sync({alter: true})

module.exports.Transaction = Transaction