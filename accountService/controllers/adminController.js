const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const { getReceivedToken } = require('../consume');

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
                    res.sendStatus(200);
                });
            }
        });
    });
};

//addAnnonceur
async function addAnnonceur(req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
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
                const sqlInsert = "INSERT INTO annonceurs (username, email, password) VALUES (?, ?, ?)";
                const insertQuery = mysql.format(sqlInsert, [username, email, password]);
                await connection.query(insertQuery, async (err, result) => {
                    connection.release();
                    if (err) throw err;
                    console.log(`Annonceur avec email ${email} a été ajouté`);
                    res.sendStatus(201);
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