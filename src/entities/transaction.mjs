import {db} from '../db.mjs';
import {DataTypes} from "sequelize";
import {User} from "./account.mjs";

export const Transaction = db.define('Transaction',{
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
