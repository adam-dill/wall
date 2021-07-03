const dotenv = require('dotenv');
const mysql = require('mysql');
const { Sequelize } = require('sequelize');
dotenv.config();


const config = {
    host     : process.env.MYSQL_HOST,
    port     : process.env.MYSQL_PORT,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
};
const connection = mysql.createConnection(config);
const sequelize = new Sequelize(config.database, config.user, config.password, {
    dialect: "mysql",
    host: config.host,
    port: config.port
});
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
    connection,
    sequelize,
    JWT_SECRET
};