const mysql = require('mysql')

require("dotenv").config()

const DB_HOST = process.env.DB_HOST
const DB_ADMIN = process.env.DB_ADMIN
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const amqp = require('amqplib');

const db = mysql.createPool({
   connectionLimit: 100,
   host: DB_HOST,
   user: DB_ADMIN,
   password: DB_PASSWORD,
   database: DB_DATABASE,
   port: DB_PORT,
   multipleStatements: true
})

 db.getConnection( (err, connection)=> {
    if (err) throw (err)
    console.log ("DB connected successful: " + connection.threadId)
 })



 module.exports = db;
