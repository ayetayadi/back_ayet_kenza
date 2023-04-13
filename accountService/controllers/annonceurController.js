const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');
const { getReceivedToken } = require('../consume');
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
        return res.status(200).json({ message: "Annonceur est mis à jour!!" });

      }
      else {
        return res.status(500).json(err);
      }
    })
  })
};

//change password of the annonceur
async function changePassword(req, res) {
  const annonceur = req.body;
  const email = req.body.email;
  console.log(email);
  let salt = await bcrypt.genSalt(10);
  let hashedOldPassword = '';
  let hashedNewPassword = '';

  if (annonceur.oldPassword) {
    hashedOldPassword = await bcrypt.hash(annonceur.oldPassword, salt);
  }

  if (annonceur.newPassword) {
    hashedNewPassword = await bcrypt.hash(annonceur.newPassword, salt);
  }

  db.getConnection(async (err, connection) => {
    if (err) throw (err);
    const sqlSearch = "SELECT * FROM annonceurs WHERE email = ?";
    const search_query = mysql.format(sqlSearch, [email]);
    await connection.query(search_query, async (err, result) => {
      if (!err) {
        if (result.length <= 0) {
          return res.status(400).json({ message: "Incorrect Old Password" })
        }
        else {
          const passwordMatch = await bcrypt.compare(annonceur.oldPassword, result[0].password);
          if (passwordMatch) {
            const sqlUpdate = "UPDATE annonceurs SET password = ? WHERE email = ?";
            const update_query = mysql.format(sqlUpdate, [hashedNewPassword, email]);
            await connection.query(update_query, async (err, result) => {
              if (!err) {
                console.log("Password Changed!!");
                return res.status(200).json({ message: "Password Updated Successfully!!" })
              }
              else {
                return res.status(500).json(err);
              }
            })
          } else {
            return res.status(400).json({ message: "Incorrect Old Password" });
          }
        }
      }
      else {
        return res.status(500).json(err);
      }
    });
  });
};






module.exports = {
  profile,
  editProfile,
  changePassword
}