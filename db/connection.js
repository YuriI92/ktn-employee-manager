const mysql = require('mysql2');
require('dotenv').config();

// connect to the database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME
    },
    console.log('Database connected.')
);

module.exports = db;
