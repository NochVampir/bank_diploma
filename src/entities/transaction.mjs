import {db} from '../db.mjs';
import {DataTypes} from "sequelize";
import {User} from "./account.mjs";

export const TRANSACTIONS_TYPES = {
    MoneySend: 'money-send',
    BalanceReplenish: 'balance-replenish',
}

export const Transaction = db.define('Transaction',{
    cost: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: TRANSACTIONS_TYPES.MoneySend
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
