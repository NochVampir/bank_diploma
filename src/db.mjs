import {Sequelize} from "sequelize";

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    dialect: "postgres",
    pool: {
        max: 40,
        min: 0,
        acquire: 30000,
        idle: 10000,
    }
});

export const db = sequelize
