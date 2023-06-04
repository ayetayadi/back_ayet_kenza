const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const { promisify } = require('util');
db.query = { promisify }.promisify(db.query);
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');

//get all the annonceurs
async function getAll(req, res) {
    db.getConnection(async (err, connection) => {
        if (err) throw (err);
        const sqlSearch = "SELECT id, username, email,tel, nomE, emailE,adresseE, domaineE, typeOffre  FROM annonceurs";
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

//Delete Annonceur from Admin
async function deleteAnnonceur(req, res) {
    const email = req.params.email;
    db.getConnection(async (err, connection) => {
        if (err) throw err;
        try {
            await connection.beginTransaction(); // start a transaction

            // Check if the annonceur exists
            const sqlSearch = "SELECT * FROM annonceurs WHERE email = ?";
            const search_query = mysql.format(sqlSearch, [email]);

            const rows = await connection.query(search_query);

            if (rows.length === 0) {
                connection.release();
                console.log(`Annonceur avec email ${email} n'existe pas`);
                return res.sendStatus(404);
            }

            const sqlDeleteAppartient = "DELETE FROM appartient WHERE id_equipe IN (SELECT id FROM equipes WHERE id_annonceur IN (SELECT id FROM annonceurs WHERE email = ?))";
            const deleteAppartientQuery = mysql.format(sqlDeleteAppartient, [email]);

            await connection.query(deleteAppartientQuery);

            const sqlDeleteMembres = "DELETE FROM membres WHERE id IN (SELECT id_membre FROM appartient WHERE id_equipe IN (SELECT id FROM equipes WHERE id_annonceur IN (SELECT id FROM annonceurs WHERE email = ?)))";
            const deleteMembresQuery = mysql.format(sqlDeleteMembres, [email]);

            await connection.query(deleteMembresQuery);

            const sqlDeleteEquipes = "DELETE FROM equipes WHERE id_annonceur IN (SELECT id FROM annonceurs WHERE email = ?)";
            const deleteEquipesQuery = mysql.format(sqlDeleteEquipes, [email]);

            await connection.query(deleteEquipesQuery);

            const sqlDeleteFactures = "DELETE FROM factures WHERE id_paiement IN (SELECT id FROM paiements WHERE email_annonceur = ?)";
            const deleteFacturesQuery = mysql.format(sqlDeleteFactures, [email]);

            await connection.query(deleteFacturesQuery);

            const sqlDeletePaiements = "DELETE FROM paiements WHERE id_annonceur IN (SELECT id FROM annonceurs WHERE email = ?)";
            const deletePaiementsQuery = mysql.format(sqlDeletePaiements, [email]);

            await connection.query(deletePaiementsQuery);

            const sqlDeleteCampagnes = "DELETE FROM campagnes WHERE id_annonceur IN (SELECT id FROM annonceurs WHERE email = ?)";
            const deleteCampagnesQuery = mysql.format(sqlDeleteCampagnes, [email]);

            await connection.query(deleteCampagnesQuery);

            const sqlDeleteAnnonceurs = "DELETE FROM annonceurs WHERE email = ?";
            const deleteAnnonceursQuery = mysql.format(sqlDeleteAnnonceurs, [email]);

            await connection.query(deleteAnnonceursQuery);

            await connection.commit(); // commit the transaction

            connection.release();
            res.status(200).send({ message: 'Annonceur deleted successfully' });
            console.log("Annonceur Deleted successfully!!");
        } catch (err) {
            console.error(err);
            await connection.rollback(); // rollback the transaction
            connection.release();
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

                    res.status(200).json({ success: true, message: 'Annonceur ajouté ', annonceur: newAnnonceur[0] });


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


