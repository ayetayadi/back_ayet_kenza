const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');

const mysql = require('mysql');

//annonceur's profile
async function profile(req, res, next) {
  return res.status(200).json({
    id: req.decodedToken.id,
    username: req.decodedToken.username,
    email: req.decodedToken.email,
    dateNaiss: req.decodedToken.dateNaiss,
    tel: req.decodedToken.tel,
    nomE: req.decodedToken.nomE,
    emailE: req.decodedToken.emailE,
    telE: req.decodedToken.telE,
    domaineE: req.decodedToken.domaineE,
    adresseE: req.decodedToken.adresseE
  });
};

//edit Profile for annonceur
async function editProfile(req, res) {
  let annonceur = res.body;
  const username = req.body.username;
  const email = req.body.email;
  const dateNaiss = req.body.dateNaiss;
  const tel = req.body.tel;
  const nomE = req.body.nomE;
  const emailE = req.body.emailE;
  const adresseE = req.body.adresseE;
  const telE = req.body.telE;
  const domaineE = req.body.domaineE;
  const id = req.decodedToken.id;
  db.getConnection(async (err, connection) => {
    if (err) throw (err);
    const sqlUpdate = "UPDATE annonceurs SET username = ?, email = ?, dateNaiss = ?, tel = ?, nomE = ?, emailE = ?, telE = ?, domaineE = ?, adresseE = ? WHERE id = ?";
    const update_query = mysql.format(sqlUpdate, [username, email, dateNaiss, tel, nomE, emailE, telE, domaineE, adresseE, id]);
    await connection.query(update_query, async (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Annonceur n'existe pas!!" });
        }
        console.log('Annonceur est mis à jour');
        return res.status(200).json({ message: "Annonceur est mis à jour!!" });

      }
      else {
        return res.status(500).json(err);
      }
    })
  })
};

async function getPermission(req, res) {
  const id_annonceur = req.decodedToken;
  db.getConnection(async (err, connection) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred');
    }

    try {
      const sqlSearch = 'SELECT typeOffre FROM annonceurs WHERE id = ?';
      const searchQuery = mysql.format(sqlSearch, [id_annonceur]);

      connection.query(searchQuery, async (err, annonceur) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Failed to fetch annonceur from database');
        }

        const typeOffre = annonceur[0].typeOffre; // Access the appropriate column value

        if (typeOffre === "Essentiel") {
          return res.status(200).json({ typeOffre: 'Essentiel' });
        } else if (typeOffre === "Standard") {
          return res.status(200).json({ typeOffre: 'Standard' });
        } else if (typeOffre === "Premium") {
          return res.status(200).json({ typeOffre: 'Premium' });
        } else {
          return res.status(200).json({ typeOffre: 'Unknown' }); // Handle other cases if needed
        }

      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('An error occurred');
    }
  });
}

module.exports = {
  getPermission
};






module.exports = {
  profile,
  editProfile,
  getPermission
}