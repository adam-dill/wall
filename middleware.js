const mysql = require('mysql');
const {connection} = require('./mysqlconfig');


const keyValidation = async (req, res, next) => {
    const {key} = req.query;
    if (!key) throw new Error("API Key is required in the URL, eg. ?key=12345");
    
    connection.query(`SELECT id FROM users WHERE api_key='${key}'`, (err, results, fields) => {
        if (err) throw err;

        res.locals = results[0]
        next();
    });
}

module.exports = {
    keyValidation
}