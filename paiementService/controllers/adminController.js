const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');

//create offre
async function createOffre(req, res) {
    try {
        const nomPack = req.body.nomPack;
        const description = req.body.description;
        const periodePack = req.body.periodePack;
        const prixPack = req.body.prixPack;

        // check if the nom of the offre is unique
        db.getConnection(async (err, connection) => {
            if (err) throw err;
            const sqlSearch = 'SELECT * FROM offres WHERE nomPack = ?';
            const searchQuery = mysql.format(sqlSearch, [nomPack]);
            await connection.query(searchQuery, async (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    connection.release();
                    console.log(`Offre avec nom du pack ${nomPack} existe déjà`);
                    return res.status(409).json({ message: `Offre avec nom du pack ${nomPack} existe déjà` })
                }
                else {
                    const sqlInsert = "INSERT INTO offres (nomPack, description, periodePack, prixPack, dateCreation) VALUES (?, ?, ?, ?, NOW())";
                    const insert_query = mysql.format(sqlInsert, [nomPack, description, periodePack, prixPack]);
                    await connection.query(insert_query, async (err, result) => {
                        connection.release();
                        if (err) throw err;
                        const newOffre = await db.query('SELECT * FROM offres WHERE nomPack = ?', [nomPack]);
                        console.log(`Offre avec nom du pack ${nomPack} a été ajouté`);
                        return res.status(200).json({ message: `Offre avec nom du pack ${nomPack} a été ajouté` , offres: newOffre[0]})

                    })
                }
            })
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

//update offre
async function updateOffre(req, res) {
    try {
        const nomOffre = req.params.nomPack;
        const nomPack = req.body.nomPack;
        const description = req.body.description;
        const periodePack = req.body.periodePack;
        const prixPack = req.body.prixPack;

        // check if the offre with the given ID exists
        db.getConnection(async (err, connection) => {
            if (err) throw err;
            const sqlSearch = 'SELECT * FROM offres WHERE nomPack = ?';
            const searchQuery = mysql.format(sqlSearch, [nomOffre]);
            await connection.query(searchQuery, async (err, result) => {
                if (err) throw err;
                if (result.length === 0) {
                    connection.release();
                    console.log(`Offre avec le nom ${nomOffre} n'existe pas`);
                    return res.status(404).json({ message: `Offre avec le nom ${nomOffre} n'existe pas` });
                }
                else {
                    // update the existing offre record
                    const sqlUpdate = 'UPDATE offres SET nomPack=?, description=?, periodePack=?, prixPack=? WHERE nomPack=?';
                    const updateQuery = mysql.format(sqlUpdate, [nomPack, description, periodePack, prixPack, nomOffre]);
                    await connection.query(updateQuery, async (err, result) => {
                        connection.release();
                        if (err) throw err;
                        console.log(`Offre avec nom ${nomOffre} a été mise à jour`);
                        const updatedOffre = await db.query('SELECT * FROM offres WHERE nomPack = ?', [nomPack]);
                        return res.status(200).json({ message: `Offre avec nom ${nomOffre} a été mise à jour`, offres: updatedOffre[0]  });
                    });
                }
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

//supprimer offre
async function deleteOffre(req, res) {
    try {
        const nomPack = req.params.nomPack;

        // check if the offre with the given ID exists
        db.getConnection(async (err, connection) => {
            if (err) throw err;
            const sqlSearch = 'SELECT * FROM offres WHERE nomPack = ?';
            const searchQuery = mysql.format(sqlSearch, [nomPack]);
            await connection.query(searchQuery, async (err, result) => {
                if (err) throw err;
                if (result.length === 0) {
                    connection.release();
                    console.log(`Offre ${nom} n'existe pas`);
                    return res.status(404).json({ message: `Offre ${nomPack} n'existe pas` });
                }
                else {
                    // delete the existing offre record
                    const sqlDelete = 'DELETE FROM offres WHERE nomPack=?';
                    const deleteQuery = mysql.format(sqlDelete, [nomPack]);
                    await connection.query(deleteQuery, async (err, result) => {
                        connection.release();
                        if (err) throw err;
                        console.log(`Offre ${nomPack} a été supprimée`);
                        return res.status(200).json({ message: `Offre ${nomPack} a été supprimée` });
                    });
                }
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

//get offres
async function getOffres(req, res) {
    try {
        // get all offres from the database
        db.getConnection(async (err, connection) => {
            if (err) throw err;
            const sql = 'SELECT * FROM offres';
            await connection.query(sql, async (err, result) => {
                connection.release();
                if (err) throw err;
                console.log(`Offres récupérées avec succès`);
                return res.status(200).json({ success: true, offres: result });
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

async function getAnnonceursFactures(req, res) {
    db.getConnection(async (err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to connect to database');
        }
        const sqlSearchFacture = 'SELECT * FROM factures';
        const searchQueryFacture = mysql.format(sqlSearchFacture);

        connection.query(searchQueryFacture, (err, facture) => {
            if (err) {
                console.error(err);
                reject('Failed to fetch facture from database');
            }
            if (!facture.length) {
                console.log(`0 factures`);
                return res.status(500).send(`0 factures`);
            }
            res.send(facture);
        });
    });
}


module.exports = {
    createOffre,
    updateOffre,
    deleteOffre,
    getOffres,
    getAnnonceursFactures
}