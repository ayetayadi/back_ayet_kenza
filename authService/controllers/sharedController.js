const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect.js');
const { promisify } = require('util');
db.query = { promisify }.promisify(db.query);
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');
const { publishAuthMessage } = require('../produce');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

//forgot Password
async function forgotPassword(req, res) {
    const email = req.body.email;
    try {
        db.getConnection(async (err, connection) => {
            if (err) throw err;

            const sqlSearchAdmins = "SELECT email FROM admins WHERE email = ?";
            const searchAdminsQuery = mysql.format(sqlSearchAdmins, [email]);
            const sqlSearchAnnonceurs = "SELECT email FROM annonceurs WHERE email = ?";
            const searchAnnonceursQuery = mysql.format(sqlSearchAnnonceurs, [email]);

            const [adminsResult, annonceursResult] = await Promise.all([
                promisify(connection.query).call(connection, searchAdminsQuery),
                promisify(connection.query).call(connection, searchAnnonceursQuery),
            ]);

            if (adminsResult.length <= 0 && annonceursResult.length <= 0) {
                return res.status(200).json({ message: "Email Not Found." });
            }

            const token = crypto.randomBytes(20).toString("hex");
            publishAuthMessage(token);

            const updateTokenQuery =
                "UPDATE ?? SET password_reset_token = ?, password_reset_token_expiration = DATE_ADD(NOW(), INTERVAL 8 HOUR) WHERE email = ?";
            const updateTokenParams =
                adminsResult.length > 0
                    ? ["admins", token, email]
                    : ["annonceurs", token, email];

            connection.query(updateTokenQuery, updateTokenParams, (err, result) => {
                if (err) {
                    console.error(err);
                    return res
                        .status(500)
                        .json({ message: "An error occurred while updating your password reset token." });
                }

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Mot de Passe oublié",
                    html:
                        '<p><b>Réinitialisation de mot de passe</b><br><a href="http://localhost:4200/resetPassword?passwordResetToken=' +
                        token +
                        '">Cliquez ici pour réinitialiser votre mot de passe</a></p>',
                };

                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                        return res
                            .status(500)
                            .json({ message: "An error occurred while sending the email." });
                    }

                    console.log("Email envoyé: " + info.response);
                    return res
                        .status(200)
                        .json({ message: "Password reset link sent successfully to your email." });
                });
            });
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "An error occurred while retrieving your account information." });
    }
}

async function resetPassword(req, res) {
    const passwordResetToken = req.query.passwordResetToken;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
  
    try {
      db.getConnection(async (err, connection) => {
        if (err) throw (err);
  
        // Search for a user with the given password reset token in the admins table
        const sqlSearch =
         "SELECT email, password_reset_token, password_reset_token_expiration  FROM (SELECT email, password_reset_token, password_reset_token_expiration  FROM admins UNION ALL  SELECT email, password_reset_token, password_reset_token_expiration FROM annonceurs ) AS users WHERE password_reset_token = ? AND password_reset_token_expiration > NOW() ";
        const search_query = mysql.format(sqlSearch, [passwordResetToken, passwordResetToken]);
  
        await connection.query(search_query, async (err, result) => {
          if (!err) {
            // If the token is valid, proceed with the password reset process
            if (result.length <= 0) {
              return res.status(400).json({ message: "Invalid or expired reset token." })
            }
  
            // Check if the new password and its confirmation match
            if (password !== confirmPassword) {
              return res.status(400).json({ message: "Passwords do not match." });
            }
  
            // Hash the new password and update the user's password in the appropriate table
            const hash = await bcrypt.hash(password, 10);
            const updateQuery = "UPDATE ?? SET password = ?, password_reset_token = NULL, password_reset_token_expiration = NULL WHERE email = ?";
            const update_query = mysql.format(updateQuery, [result[0].email.indexOf('@admins.com') !== -1 ? 'admins' : 'annonceurs', hash, result[0].email]);
  
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
    forgotPassword,
    resetPassword
}