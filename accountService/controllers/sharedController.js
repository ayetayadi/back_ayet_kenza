const mysql = require('mysql');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const util = require('util');
const bcrypt = require('bcrypt');
db.query = util.promisify(db.query);

// Vérifier le role de l'acteur
async function verifyRole(req, res) {
    let token = req.query.token;
    console.log(`token ${token}`);
    let decodedToken = {};
    let decodedTokenA = { id: '', email: '', username: '', dateNaiss: '', tel: '', nomE: '', emailE: '', telE: '', domaineE: '', adresseE: '' };
    let decodedTokenAd = { id: '', email: '' };
    let decodedTokenM = { id: '', email: '', code:'' };

    try {
        decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        decodedTokenA = decodedToken.annonceur ? decodedToken.annonceur : decodedTokenA;
        decodedTokenAd = decodedToken.admin ? decodedToken.admin : decodedTokenA;
        decodedTokenM = decodedToken.membre ? decodedToken.membre : decodedTokenM;

    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Unauthorized request' });
    }

    const email = decodedTokenAd.email;
    console.log(`email de l'admin: ` + email);
    const emailA = decodedTokenA.email;
    console.log(`email de l'annonceur: ` + emailA);
    const emailM = decodedTokenM.email;
    console.log(`email du membre: ` + emailM);

    try {
        const adminsQuery = "SELECT * FROM admins WHERE email = ?";
        const annonceursQuery = "SELECT * FROM annonceurs WHERE email = ?";
        const membresQuery = "SELECT * FROM membres WHERE email = ?";
        const [adminsRows, annonceursRows, membresRows] = await Promise.all([
            db.query(adminsQuery, [email]),
            db.query(annonceursQuery, [emailA]),
            db.query(membresQuery, [emailM])
        ]);

        if (adminsRows.length > 0) {
            return res.status(200).json({ role: 'admin' });
        } else if (annonceursRows.length > 0) {
            const annonceurData = decodedToken;
            if (annonceurData.id && annonceurData.username && annonceurData.dateNaiss && annonceurData.tel && annonceurData.nomE && annonceurData.emailE && annonceurData.telE && annonceurData.domaineE && annonceurData.adresseE) {
                return res.status(200).json({
                    role: 'annonceur',
                    id: annonceurData.id,
                    username: annonceurData.username,
                    email: emailA,
                    dateNaiss: annonceurData.dateNaiss,
                    tel: annonceurData.tel,
                    nomE: annonceurData.nomE,
                    emailE: annonceurData.emailE,
                    telE: annonceurData.telE,
                    domaineE: annonceurData.domaineE,
                    adresseE: annonceurData.adresseE,
                });
            } else {
                return res.status(200).json({ role: 'annonceur' });
            }
        } else if (membresRows.length > 0) {
            const membreData = decodedTokenM;
            console.log(membreData);
            if (membreData.id && membreData.email) {
                return res.status(200).json({
                    role: 'membre',
                    id: membreData.id,
                    email: membreData.email,
                    code: membreData.code,

                });
            } else {
                return res.status(200).json({ role: 'membre' });
            }
        } else {
            return res.status(400).json({ message: 'User not found' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getToken(req, res) {
    let token = req.query.token;
    console.log(`token ${token}`);
    let decodedToken = {};
    let decodedTokenA = { id: '', email: '', username: '', dateNaiss: '', tel: '', nomE: '', emailE: '', telE: '', domaineE: '', adresseE: '' };

    try {
        decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        decodedTokenA = decodedToken.annonceur ? decodedToken.annonceur : decodedTokenA;
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Unauthorized request' });
    }

    const email = decodedToken.email;
    console.log(`email de l'admin: ` + email)
    const emailA = decodedTokenA.email;
    console.log(`email de l'annonceur: ` + emailA)

    try {
        const adminsQuery = "SELECT * FROM admins WHERE email = ?";
        const annonceursQuery = "SELECT * FROM annonceurs WHERE email = ?";
        const [adminsRows, annonceursRows] = await Promise.all([
            db.query(adminsQuery, [email]),
            db.query(annonceursQuery, [emailA])
        ]);
        if (adminsRows.length > 0) {
            return res.status(200).json({ role: 'admin', token: token });
        } else if (annonceursRows.length > 0) {
            const annonceurData = decodedToken;
            if (annonceurData.id && annonceurData.username && annonceurData.dateNaiss && annonceurData.tel && annonceurData.nomE && annonceurData.emailE && annonceurData.telE && annonceurData.domaineE && annonceurData.adresseE) {
                return res.status(200).json({
                    role: 'annonceur',
                    token: token,
                    id: annonceurData.id,
                    username: annonceurData.username,
                    email: emailA,
                    dateNaiss: annonceurData.dateNaiss,
                    tel: annonceurData.tel,
                    nomE: annonceurData.nomE,
                    emailE: annonceurData.emailE,
                    telE: annonceurData.telE,
                    domaineE: annonceurData.domaineE,
                    adresseE: annonceurData.adresseE,
                });
            } else {
                return res.status(200).json({ role: 'annonceur', token: token });
            }
        } else {
            return res.status(400).json({ message: 'User not found' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

async function resetPassword(req, res) {
    const passwordResetToken = req.query.passwordResetToken;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    try {
        db.getConnection(async (err, connection) => {
            if (err) throw (err);

            // Search for a user with the given password reset token in the admins table
            const sqlSearch =
                "SELECT email, password_reset_token, password_reset_token_expiration FROM (SELECT email, password_reset_token, password_reset_token_expiration FROM admins WHERE password_reset_token = ? AND password_reset_token_expiration > NOW() UNION ALL SELECT email, password_reset_token, password_reset_token_expiration FROM annonceurs WHERE password_reset_token = ? AND password_reset_token_expiration > NOW()) AS users";
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
                    const table = result[0].email.indexOf('bannermanagement01@gmail.com') !== -1 ? 'admins' : 'annonceurs';
                    const updateQuery = `UPDATE ?? SET password = ?, password_reset_token = NULL, password_reset_token_expiration = NULL WHERE email = ?`;
                    const update_query = mysql.format(updateQuery, [table, hash, result[0].email]);


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
    verifyRole,
    getToken,
    resetPassword
}
