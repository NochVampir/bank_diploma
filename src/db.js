const { Sequelize } = require('sequelize');

const sequelize = new Sequelize("bank_diplom", "postgres", "1234", {
    dialect: "postgres"
});

module.exports.db = sequelize