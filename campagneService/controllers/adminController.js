const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');

//get all campagnes of a specific annonceur
async function getCampagnesByAnnonceur(req, res) {
    const AnnonceurEmail = req.params.email;
  
    db.getConnection(async (err, connection) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to connect to database');
      }
      const sql = `SELECT c.*
      FROM campagnes c
      INNER JOIN annonceurs a ON c.id_annonceur = a.id
      WHERE a.email = ?
    `;
      const values = [AnnonceurEmail];
      await connection.query(sql,values, async (err, result) => {
        connection.release();
        if (err) {
          console.error(err);
          return res.status(500).send('Failed to fetch campagnes from database');
        }
        res.send(result);
        console.log(`Found ${result.length} campagnes publicitaires for annonceur "${AnnonceurEmail}"`);
        
      });
    });
  }
  
  
  
  
  module.exports = {
    getCampagnesByAnnonceur
  }