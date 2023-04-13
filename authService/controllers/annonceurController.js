const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');
const { publishAuthMessage } = require('../produce');

//register Annonceur
async function register(req, res) {
  console.log("---------> Username:" + req.body.username);
  const username = req.body.username;
  console.log("---------> Email:" + req.body.email);
  const email = req.body.email;
  console.log("---------> Password:" + req.body.password);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  console.log("---------> Date de naissance:" + req.body.dateNaiss);
  const dateNaiss = req.body.dateNaiss;
  console.log("---------> Tel:" + req.body.tel);
  const tel = req.body.tel;
  console.log("---------> Nom d'entreprise:" + req.body.nomE);
  const nomE = req.body.nomE;
  console.log("---------> Email d'entreprise:" + req.body.emailE);
  const emailE = req.body.emailE;
  console.log("---------> Domaine d'entreprise:" + req.body.domaineE);
  const telE = req.body.telE;
  console.log("---------> Téléphone d'entreprise:" + req.body.telE);
  const domaineE = req.body.domaineE;
  console.log("---------> Adresse d'entreprise:" + req.body.adresseE);
  const adresseE = req.body.adresseE;
  db.getConnection(async (err, connection) => {
    if (err) {
      throw err;
    } else {
      const sqlSearch = "SELECT * FROM annonceurs WHERE email = ?";
      const search_query = mysql.format(sqlSearch, [email]);
      const sqlInsert = "INSERT INTO annonceurs(username, email, password, dateNaiss, tel, nomE, emailE, telE, domaineE, adresseE) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const insert_query = mysql.format(sqlInsert, [username, email, hashedPassword, dateNaiss, tel, nomE, emailE, telE, domaineE, adresseE]);

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
                const token = jwt.sign({ username, email, tel, dateNaiss, nomE, emailE, telE, domaineE, adresseE }, process.env.TOKEN, { expiresIn: '8h' });
                console.log(result.insertId);
                res.status(200).json({ token: token });
                publishAuthMessage(token)

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
            dateNaiss: result[0].dateNaiss,
            nomE: result[0].nomE,
            emailE: result[0].emailE,
            telE: result[0].telE,
            domaineE: result[0].domaineE,
            adresseE: result[0].adresseE,
          }
          const token = jwt.sign({ annonceur }, process.env.TOKEN, { expiresIn: '24h' });
          console.log('---------> Login Annonceur Successful')
          res.status(200).json({ token: token });
          publishAuthMessage(token)

        }
        else {
          console.log('---------> Annonceur\'s Email or Password are invalid')
          res.send('Email or Password are invalid!')
        }
      }
    })
  })
};


var transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
})
  //forgot Password by sending an email
  async function forgotPassword(req, res) {
    const email = req.body.email;
    try {
      db.getConnection(async (err, connection) => {
        if (err) throw (err);
        const sqlSearch = "SELECT * FROM annonceurs WHERE email = ?";
        const search_query = mysql.format(sqlSearch, [email]);
        await connection.query(search_query, (err, result) => {
          if (!err) {
            if (result.length <= 0) {
              return res.status(200).json({ message: "Email Not Found." })
            }
            else {
              const token = crypto.randomBytes(20).toString('hex');
              publishAuthMessage(token);
              const updateTokenQuery = "UPDATE annonceurs SET password_reset_token = ?, password_reset_token_expiration = DATE_ADD(NOW(), INTERVAL 8 HOUR) WHERE email = ?";
              const updateTokenParams = [token, email];
              connection.query(updateTokenQuery, updateTokenParams, (err, result) => {
                if (!err) {
                  const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Mot de Passe oublié',
                    html: '<p><b>Réinitialisation de mot de passe</b><br><a href="http://localhost:4200/resetPassword?passwordResetToken=' + token + '">Cliquez ici pour réinitialiser votre mot de passe</a></p>'
                  };
                  transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                      console.log(err);
                      return res.status(500).json({ message: "An error occurred while sending the email." });
                    }
                    else {
                      console.log('Email envoyé: ' + info.response)
                      return res.status(200).json({ message: "Password reset link sent successfully to your email." })
                    }
                  });
                }
                else {
                  console.error(err);
                  return res.status(500).json({ message: "An error occurred while updating your password reset token." });
                }
              });
            }
          }
          else {
            console.error(err);
            return res.status(500).json({ message: "An error occurred while retrieving your account information." });
          }
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while sending the email." });
    }
  };
  
  //reset Password
  async function resetPassword(req, res) {
    const passwordResetToken = req.query.passwordResetToken;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    console.log('--------->passwordResetToken: ' + passwordResetToken);
    console.log('--------->password: ' + password);
    console.log('--------->confirmPassword: ' + confirmPassword);
    try {
      db.getConnection(async (err, connection) => {
        if (err) throw (err);
        const sqlSearch = "SELECT * FROM annonceurs WHERE password_reset_token = ? AND password_reset_token_expiration > NOW()";
        const search_query = mysql.format(sqlSearch, [passwordResetToken]);
        await connection.query(search_query, async (err, result) => {
          if (!err) {
            if (result.length <= 0) {
              return res.status(400).json({ message: "Invalid or expired reset token." })
            }
            if (password !== confirmPassword) {
              return res.status(400).json({ message: "Passwords do not match." });
            }
            const hash = await bcrypt.hash(password, 10);
            const updateQuery = "UPDATE annonceurs SET password = ?, password_reset_token = NULL, password_reset_token_expiration = NULL WHERE email = ?";
            const update_query = mysql.format(updateQuery, [hash, result[0].email]);
            await connection.query(update_query, (err, result) => {
              if (!err) {
                return res.status(200).json({ message: "Password reset successfully." })
              } else {
                console.error(err);
                return res.status(500).json({ message: "An error occurred while updating your password." });
              }
            });
          } else {
            console.error(err);
            return res.status(500).json({ message: "An error occurred while retrieving your account information." });
          }
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while resetting your password." });
    }
  };

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};
