const mysql = require('mysql');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const util = require('util');
const axios = require('axios');

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
      const result = await db.query(
        `INSERT INTO campagnes (nom, description, start_date, update_date, id_annonceur) VALUES (?, ?, NOW(), '1000-01-01 00:00:00', ?)`,
        [req.body.nom, req.body.description, id_annonceur]
      );
  
      const newCampagneId = result.insertId;
  
      // fetch the newly created campagne
      const newCampagne = await db.query('SELECT * FROM campagnes WHERE id = ?', [newCampagneId]);
  
      res.status(200).json({ success: true, message: 'Votre campagne est créée avec succès', campagne: newCampagne[0] });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Erreur' });
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
          if (result.affectedRows === 0) {
            connection.release();
            console.log(`Campagne avec nom ${nomA} n'existe pas`);
            res.sendStatus(404);
          } else {
            const sqlSelect = 'SELECT * FROM campagnes WHERE nom = ?';
            const select_query = mysql.format(sqlSelect, [nom]);
  
            await connection.query(select_query, async (err, newCampagne) => {
              connection.release();
              if (err) throw err;
              console.log(`Campagne avec nom ${nomA} a été mis à jour`);
              res.status(200).json({ success: true, message: 'Votre campagne est mise à jour', campagne: newCampagne[0] });
            });
          }
        });
      });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
  

//delete Campagne created by an annonceur
async function deleteCampagne(req, res) {
    try {
      const id_annonceur = req.decodedToken;
      const nom = req.params.nom;
  
      // Check if the campaign exists
      const sqlSelect = 'SELECT id_annonceur FROM campagnes WHERE nom = ?';
      const selectQuery = mysql.format(sqlSelect, [nom]);
      const selectResult = await db.query(selectQuery);
  
      if (selectResult.length === 0) {
        return res.status(404).json({ success: false, message: 'Campagne not found' });
      }
  
      if (selectResult[0].id_annonceur !== id_annonceur) {
        return res.status(401).json({ success: false, message: 'Unauthorized request' });
      }
  
      // Get the token for the annonceur
      const sqlSelectA = 'SELECT token FROM annonceurs WHERE id = ?';
      const selectQueryA = mysql.format(sqlSelectA, [id_annonceur]);
      const tokenResult = await db.query(selectQueryA);
  
      if (tokenResult.length === 0) {
        return res.status(404).json({ success: false, message: 'Annonceur not found' });
      }
  
      const token = tokenResult[0].token;
  
     /* //HTTP request to delete banners
      const deleteBannersUrl = `http://localhost:3005/bannerService/annonceur/deleteBanners/${nom}`;
      const deleteBannersConfig = { params: { token } };
      await axios.delete(deleteBannersUrl, deleteBannersConfig);*/
  
      // Delete the campaign from the database
      const sqlDelete = 'DELETE FROM campagnes WHERE nom = ?';
      const deleteQuery = mysql.format(sqlDelete, [nom]);
      const deleteResult = await db.query(deleteQuery);
  
      if (deleteResult.affectedRows === 0) {
        return res.status(500).json({ success: false, message: 'Failed to delete campagne' });
      }
  
      return res.status(200).json({ success: true, message: 'Campagne deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
  
  
  

module.exports = {
    createCampagne,
    getAllCampagnes,
    updateCampagne,
    deleteCampagne
}
