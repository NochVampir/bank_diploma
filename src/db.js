const { Sequelize } = require('sequelize');

const sequelize = new Sequelize("bank_diplom", "postgres", "0000", {
    dialect: "postgres",
    pool: {
        max: 40,
        min: 0,
        acquire: 30000,
        idle: 10000,
    }
});

module.exports.db = sequelize
