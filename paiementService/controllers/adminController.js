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
                        console.log(`Offre avec nom du pack ${nomPack} a été ajouté`);
                        return res.status(200).json({ message: `Offre avec nom du pack ${nomPack} a été ajouté` })

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
        const idOffre = req.params.id;
        const nomPack = req.body.nomPack;
        const description = req.body.description;
        const periodePack = req.body.periodePack;
        const prixPack = req.body.prixPack;

        // check if the offre with the given ID exists
        db.getConnection(async (err, connection) => {
            if (err) throw err;
            const sqlSearch = 'SELECT * FROM offres WHERE idOffre = ?';
            const searchQuery = mysql.format(sqlSearch, [idOffre]);
            await connection.query(searchQuery, async (err, result) => {
                if (err) throw err;
                if (result.length === 0) {
                    connection.release();
                    console.log(`Offre avec ID ${idOffre} n'existe pas`);
                    return res.status(404).json({ message: `Offre avec ID ${idOffre} n'existe pas` });
                }
                else {
                    // update the existing offre record
                    const sqlUpdate = 'UPDATE offres SET nomPack=?, description=?, periodePack=?, prixPack=? WHERE idOffre=?';
                    const updateQuery = mysql.format(sqlUpdate, [nomPack, description, periodePack, prixPack, idOffre]);
                    await connection.query(updateQuery, async (err, result) => {
                        connection.release();
                        if (err) throw err;
                        console.log(`Offre avec ID ${idOffre} a été mise à jour`);
                        return res.status(200).json({ message: `Offre avec ID ${idOffre} a été mise à jour` });
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
        const idOffre = req.params.id;

        // check if the offre with the given ID exists
        db.getConnection(async (err, connection) => {
            if (err) throw err;
            const sqlSearch = 'SELECT * FROM offres WHERE idOffre = ?';
            const searchQuery = mysql.format(sqlSearch, [idOffre]);
            await connection.query(searchQuery, async (err, result) => {
                if (err) throw err;
                if (result.length === 0) {
                    connection.release();
                    console.log(`Offre avec ID ${idOffre} n'existe pas`);
                    return res.status(404).json({ message: `Offre avec ID ${idOffre} n'existe pas` });
                }
                else {
                    // delete the existing offre record
                    const sqlDelete = 'DELETE FROM offres WHERE idOffre=?';
                    const deleteQuery = mysql.format(sqlDelete, [idOffre]);
                    await connection.query(deleteQuery, async (err, result) => {
                        connection.release();
                        if (err) throw err;
                        console.log(`Offre avec ID ${idOffre} a été supprimée`);
                        return res.status(200).json({ message: `Offre avec ID ${idOffre} a été supprimée` });
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

module.exports = {
    createOffre,
    updateOffre,
    deleteOffre,
    getOffres
}