const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');

//get all teams of a specific annonceur
async function getTeamsByAnnonceur(req, res) {
    const AnnonceurEmail = req.params.email;
  
    db.getConnection(async (err, connection) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to connect to database');
      }
      const sql = `SELECT e.*
      FROM equipes e
      INNER JOIN annonceurs a ON e.id_annonceur = a.id
      WHERE a.email = ?
    `;
      const values = [AnnonceurEmail];
      await connection.query(sql,values, async (err, result) => {
        connection.release();
        if (err) {
          console.error(err);
          return res.status(500).send('Failed to fetch members from database');
        }
        res.send(result);
        console.log(`Found ${result.length} teams for annonceur "${AnnonceurEmail}"`);
        
      });
    });
  }
  
  
  
  
  module.exports = {
      getTeamsByAnnonceur
  }