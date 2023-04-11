const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');
const produce = require('../produce');

//register Annonceur
async function register(req, res) {
  console.log("---------> Username:" + req.body.username);
  const username = req.body.username;
  console.log("---------> Email:" + req.body.email);
  const email = req.body.email;
  console.log("---------> Password:" + req.body.password);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  console.log("---------> Tel:" + req.body.tel);
  const tel = req.body.tel;
  console.log("---------> Nom d'entreprise:" + req.body.nomE);
  const nomE = req.body.nomE;
  console.log("---------> Email d'entreprise:" + req.body.emailE);
  const emailE = req.body.emailE;
  console.log("---------> Domaine d'entreprise:" + req.body.domaineE);
  const domaineE = req.body.domaineE;
  console.log("---------> Adresse d'entreprise:" + req.body.adresseE);
  const adresseE = req.body.adresseE;
  db.getConnection(async (err, connection) => {
    if (err) {
      throw err;
    } else {
      const sqlSearch = "SELECT * FROM annonceurs WHERE email = ?";
      const search_query = mysql.format(sqlSearch, [email]);
      const sqlInsert = "INSERT INTO annonceurs(username, email, password, tel, nomE, emailE, domaineE, adresseE) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)";
      const insert_query = mysql.format(sqlInsert, [username, email, hashedPassword, tel, nomE, emailE, domaineE, adresseE]);

      await connection.query(search_query, async (err, result) => {
        if (err) {
          throw err;
        } else {
          console.log("------> Search Results");
          console.log(result.length);
          if (result.length != 0) {
            connection.release();
            console.log("------> Annonceur already exists");
            res.sendStatus(409);
          } else {
            await connection.query(insert_query, (err, result) => {
              connection.release();
              if (err) {
                throw err;
              } else {
                console.log("--------> Nouveau Annonceur Créé");
                const token = jwt.sign({ username, email, tel, nomE, emailE, domaineE, adresseE }, process.env.TOKEN, { expiresIn: '8h' });
                console.log(result.insertId);
                res.status(200).json({ token: token });
                produce.publishAuthMessage(token)
              }
            });
          }
        }
      });
    }
  });
};

//login Annonceur
async function login(req, res) {
  const annonceur = req.body.email;
  const password = req.body.password;
  db.getConnection(async (err, connection) => {
    if (err) throw (err)
    const sqlSearch = 'SELECT * FROM annonceurs WHERE email = ?';
    const search_query = mysql.format(sqlSearch, [annonceur]);
    await connection.query(search_query, async (err, result) => {
      connection.release()
      if (err) throw (err)
      if (result.length == 0) {
        console.log('--------> Annonceur does not exist')
        res.sendStatus(404)
      }
      else {
        const hashedPassword = result[0].password;
        if (await bcrypt.compare(password, hashedPassword)) {
          const annonceur = {
            id: result[0].id,
            username: result[0].username,
            email: result[0].email,
            tel: result[0].tel,
            nomE: result[0].nomE,
            emailE: result[0].emailE,
            domaineE: result[0].domaineE,
            adresseE: result[0].adresseE,
          }
          const token = jwt.sign({ annonceur }, process.env.TOKEN, { expiresIn: '24h' });
          console.log('---------> Login Annonceur Successful')
          res.status(200).json({ token: token });
          produce.publishAuthMessage(token)
        }
        else {
          console.log('---------> Annonceur\'s Email or Password are invalid')
          res.send('Email or Password are invalid!')
        }
      }
    })
  })
};

module.exports = {
    register,
    login
  };
  