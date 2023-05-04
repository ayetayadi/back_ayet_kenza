const mysql = require('mysql');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const util = require('util');
const { getReceivedToken } = require('../consume');
const { publishCampagneMessage } = require('../produce');

db.query = util.promisify(db.query);

//create campagne
async function createCampagne(req, res) {
    try {
        const id_annonceur = req.decodedToken;

        // check if the nom of the campagne is unique for the annonceur
        const existingCampagne = await db.query('SELECT id FROM campagnes WHERE nom = ? AND id_annonceur = ?', [req.body.nom, id_annonceur]);
        if (existingCampagne.length > 0) {
            return res.status(400).json({ success: false, message: 'A campaign with the same name already exists for this annonceur' });
        }

        // insert the new campagne
        const result = await db.query(`INSERT INTO campagnes (nom, description, start_date, update_date, id_admin, id_annonceur) VALUES (?, ?, NOW(), NOW(), 0, ?)`, [req.body.nom, req.body.description, id_annonceur]);

        const newCampagneId = result.insertId;
        const newCampagneNom = req.body.nom;
        publishCampagneMessage(newCampagneId, newCampagneNom);

        res.status(200).json({ success: true, message: 'Campaign created successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

//get All campagnes created by annonceur
async function getAllCampagnes(req, res) {
    try {
        const id_annonceur = req.decodedToken;

        db.getConnection(async (err, connection) => {
            if (err) throw (err);
            const sqlSearch = 'SELECT * FROM campagnes WHERE id_annonceur = ?';
            const search_query = mysql.format(sqlSearch, [id_annonceur]);
            await connection.query(search_query, async (err, result) => {
                connection.release();
                if (err) {
                    console.error(err);
                    return res.status(500).send('Failed to fetch teams from database');
                }
                if (result.length == 0) {
                    console.log(`No ads campagnies found for id_annonceur: ${id_annonceur}`);
                    return res.status(404).send('No ads campagnies found');
                }
                res.status(200).send(result);
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

//updateCampagne
async function updateCampagne(req, res) {
    try {
        const id_annonceur = req.decodedToken;
        const nomA = req.params.nom;
        const nom = req.body.nom;
        const description = req.body.description;

        db.getConnection(async (err, connection) => {
            if (err) throw (err);
            const sqlUpdate = 'UPDATE campagnes SET nom = ?, description = ?, update_date = NOW() WHERE id_annonceur = ? AND nom = ?';
            const update_query = mysql.format(sqlUpdate, [nom, description, id_annonceur, nomA]);
            await connection.query(update_query, async (err, result) => {
                if (err) throw err;
                if (result.length == 0) {
                    connection.release();
                    console.log(`Campagne avec nom ${nomA} n'existe pas`);
                    res.sendStatus(404);
                } else {
                    const sqlUpdate = "UPDATE campagnes SET nom = ?, description = ? WHERE nom = ?";
                    const update_query = mysql.format(sqlUpdate, [nom, description, nomA]);
                    await connection.query(update_query, async (err, result) => {
                        connection.release();
                        if (err) throw err;
                        console.log(`Campagne avec nom ${nomA} a été mis à jour`);
                    });
                }
            });
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

//delete Campagne created by an annonceur
async function deleteCampagne(req, res) {
    try {
        const id_annonceur = req.decodedToken;
        const nom = req.params.nom;

        db.getConnection(async (err, connection) => {
            if (err) throw err;

            const sqlSelect = 'SELECT id_annonceur FROM campagnes WHERE nom = ?';
            const selectQuery = mysql.format(sqlSelect, [nom]);

            await connection.query(selectQuery, async (err, result) => {
                connection.release();

                if (err) {
                    console.error(err);
                    return res.status(500).send('Failed to delete campagne in database');
                }

                if (result.length === 0) {
                    return res.status(404).json({ success: false, message: 'Campagne not found' });
                }

                if (result[0].id_annonceur !== id_annonceur) {
                    return res.status(401).json({ success: false, message: 'Unauthorized request' });
                }

                const sqlDelete = 'DELETE FROM campagnes WHERE nom = ?';
                const deleteQuery = mysql.format(sqlDelete, [nom]);
                const deleteResult = await db.query(deleteQuery);

                if (deleteResult.affectedRows === 0) {
                    return res.status(500).json({ success: false, message: 'Failed to delete campagne' });
                }

                res.status(200).json({ success: true, message: 'Campagne deleted successfully' });
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

module.exports = {
    createCampagne,
    getAllCampagnes,
    updateCampagne,
    deleteCampagne
}
