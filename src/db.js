const { Sequelize } = require('sequelize');

const sequelize = new Sequelize("bank_diplom", "postgres", "0000", {
    dialect: "postgres"
});

module.exports.db = sequelize
