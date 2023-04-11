const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');

//annonceur's profile
async function profile(req, res, next) {
    return res.status(200).json({
      id: req.decodedToken.id,
      username: req.decodedToken.username,
      email: req.decodedToken.email,
      tel: req.decodedToken.tel,
      nomE: req.decodedToken.nomE,
      emailE: req.decodedToken.emailE,
      domaineE: req.decodedToken.domaineE,
      adresseE: req.decodedToken.adresseE
    });
  }
  
  //edit Profile for annonceur
  async function editProfile(req, res) {
    let annonceur = res.body;
    const username = req.body.username;
    const email = req.body.email;
    const tel = req.body.tel;
    const nomE = req.body.nomE;
    const emailE = req.body.emailE;
    const adresseE = req.body.adresseE;
    const domaineE = req.body.domaineE;
    const id = req.decodedToken.id;
    db.getConnection(async (err, connection) => {
      if (err) throw (err);
      const sqlUpdate = "UPDATE annonceurs SET username = ?, email = ?, tel = ?, nomE = ?, emailE = ?, domaineE = ?, adresseE = ? WHERE id = ?";
      const update_query = mysql.format(sqlUpdate, [username, email, tel, nomE, emailE, domaineE, adresseE, id]);
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
    profile,
    editProfile,
    changePassword,
    forgotPassword,
    resetPassword
  }