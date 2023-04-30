const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const { getReceivedToken } = require('../consume');
const { promisify } = require('util');
db.query = { promisify }.promisify(db.query);
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');

//get all the annonceurs
async function getAll(req, res) {
    db.getConnection(async (err, connection) => {
        if (err) throw (err);
        const sqlSearch = "SELECT id, username, email FROM annonceurs";
        await connection.query(sqlSearch, async (err, result) => {
            if (err) throw (err);
            if (result.length == 0) {
                connection.release();
                console.log(`Il y'a pas des annonceurs!!`);
                res.status(400).send(err);
            } else {
                res.status(200).send(result);
            }
        });
    });
};

//Delete Annocneur from Admin
async function deleteAnnonceur(req, res) {
    const email = req.params.email;
    db.getConnection(async (err, connection) => {
        if (err) throw (err);
        try {
            await connection.beginTransaction(); // start a transaction
            // Check if the annonceur exists
            const sqlSearch = "SELECT * FROM annonceurs WHERE email = ?";
            const search_query = mysql.format(sqlSearch, [email]);
            await connection.query(search_query, async (err, result) => {
                if (err) throw (err);
                if (result.length == 0) {
                    connection.release();
                    console.log(`Annonceur avec email ${email} n'existe pas`);
                    res.sendStatus(404);
                } else {
                    const sqlDelete = `
                        SET SQL_SAFE_UPDATES = 0;
                        START TRANSACTION;
                        DELETE FROM appartient WHERE id_equipe IN (SELECT id FROM equipes WHERE id_annonceur IN (SELECT id FROM annonceurs WHERE email = ?));
                        DELETE FROM membres WHERE id IN (SELECT id_membre FROM appartient);
                        DELETE FROM equipes WHERE id_annonceur IN (SELECT id FROM annonceurs WHERE email = ?);
                        DELETE FROM annonceurs WHERE email = ?;
                        COMMIT;
                    `;
                    const delete_query = {
                        sql: sqlDelete,
                        values: [email, email, email],
                        multipleStatements: true
                    };
                    await connection.query(delete_query, async (err, result) => {
                        connection.release();
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Failed to delete annonceur from database');
                        }
                        if (!result && !result[2] && result[2].affectedRows == 0) {
                            console.log(`No annonceur found for email: ${email}`);
                            return res.status(404).send('No annonceur found');
                        }
                        res.status(200).send({ message: 'Annonceur deleted successfully' });
                        console.log("Annoceur Deleted succesfully!!")
                    });
                }
            });
        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    });
};


//edit Annonceur from Admin
async function editAnnonceur(req, res) {
    const emailA = req.params.email;
    const username = req.body.username;
    const email = req.body.email;
    const tel = req.body.tel;
    const nomE = req.body.nomE;
    const emailE = req.body.emailE;
    const adresseE = req.body.adresseE;
    const domaineE = req.body.domaineE;
    db.getConnection(async (err, connection) => {
        if (err) throw err;
        const sqlSearch = "SELECT * FROM annonceurs WHERE email = ?";
        const searchQuery = mysql.format(sqlSearch, [emailA]);
        await connection.query(searchQuery, async (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                connection.release();
                console.log(`Annonceur avec email ${emailA} n'existe pas`);
                res.sendStatus(404);
            } else {
                const sqlUpdate = "UPDATE annonceurs SET username = ?, email = ?, tel = ?, nomE = ?, emailE = ?, domaineE = ?, adresseE = ? WHERE email = ?";
                const update_query = mysql.format(sqlUpdate, [username, email, tel, nomE, emailE, domaineE, adresseE, emailA]);
                await connection.query(update_query, async (err, result) => {
                    connection.release();
                    if (err) throw err;
                    console.log(`Annonceur avec email ${emailA} a été mis à jour`);
                });
            }
        });
    });
};

var transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

//addAnnonceur
async function addAnnonceur(req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const dateNaiss = req.body.dateNaiss;
    const tel = req.body.tel;
    const nomE = req.body.nomE;
    const emailE = req.body.emailE;
    const telE = req.body.telE;
    const domaineE = req.body.domaineE;
    const adresseE = req.body.adresseE;

    db.getConnection(async (err, connection) => {
        if (err) throw err;
        const sqlSearch = "SELECT * FROM annonceurs WHERE email = ?";
        const searchQuery = mysql.format(sqlSearch, [email]);
        await connection.query(searchQuery, async (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                connection.release();
                console.log(`Annonceur avec email ${email} existe déjà`);
                res.sendStatus(409);
            } else {
                const sqlInsert = "INSERT INTO annonceurs(username, email, password, dateNaiss, tel, nomE, emailE, telE, domaineE, adresseE) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                const insert_query = mysql.format(sqlInsert, [username, email, hashedPassword, dateNaiss, tel, nomE, emailE, telE, domaineE, adresseE]);
                await connection.query(insert_query, async (err, result) => {
                    connection.release();
                    if (err) throw err;
                    console.log(`Annonceur avec email ${email} a été ajouté`);
                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: "Bienvenue au Banner",
                        html:
                            `<p><b>Vous avez été ajouté pour rejoindre Banner avec mot de passe ${password}</b><br><a href="http://localhost:4200/">Cliquez ici pour se connecter au Banner</a></p>`,
                    };
    
                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.log(err);
                            return res
                                .status(500)
                                .json({ message: "An error occurred while sending the email." });
                        }
    
                        console.log("Email envoyé: " + info.response);
                        return res
                            .status(200)
                            .json({ message: "Ajouté Annonceur." });
                    })
                
                });
            }
        });
    });
};



module.exports = {
    getAll,
    deleteAnnonceur,
    editAnnonceur,
    addAnnonceur
}