const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect.js');
const { publishAuthMessage } = require('../produce');

//add admin
async function add(req, res) {
    console.log("---------> Email:" + req.body.email);
    const email = req.body.email;
    console.log("---------> Password:" + req.body.password);
    salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    db.getConnection(async (err, connection) => {
        if (err) throw err;
        const sqlSearch = "SELECT * FROM admins WHERE email = ?";
        const search_query = mysql.format(sqlSearch, [email]);
        const sqlInsert = "INSERT INTO admins VALUES (0, ?, ?)";
        const insert_query = mysql.format(sqlInsert, [email, hashedPassword]);

        await connection.query(search_query, async (err, result) => {
            if (err) throw err;
            console.log("------> Search Results");
            console.log(result.length);
            if (result.length != 0) {
                connection.release();
                console.log("------> Admin already exists");
                res.sendStatus(409);
            } else {
                await connection.query(insert_query, (err, result) => {
                    connection.release();
                    if (err) throw err;
                    console.log("--------> Nouveau Admin Créé");
                    console.log(result.insertId);
                    res.sendStatus(201);
                });
            }
        });
    });
};

//loginadmin
async function login(req, res) {
    const admin = req.body.email
    const password = req.body.password
    db.getConnection(async (err, connection) => {
        if (err) throw (err)
        const sqlSearch = "Select * from admins where email = ?"
        const search_query = mysql.format(sqlSearch, [admin])
        await connection.query(search_query, async (err, result) => {
            connection.release()

            if (err) throw (err)
            if (result.length == 0) {
                console.log("--------> Admin does not exist")
                res.sendStatus(404)
            }
            else {
                const hashedPassword = result[0].password

                if (await bcrypt.compare(password, hashedPassword)) {

                    const token = jwt.sign({ email: admin }, process.env.TOKEN);
                    console.log("--------->  Admin Login Successful")
                    res.json({ token: token });
                    publishAuthMessage(token)
                }
                else {
                    console.log("---------> Admin's Email or Password are invalid")
                    res.send("Email or Password are invalid!")
                }
            }
        })
    })
};




module.exports = {
    add,
    login
}