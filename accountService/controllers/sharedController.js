const mysql = require('mysql');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const util = require('util');
const consume = require('../consume');

db.query = util.promisify(db.query);

async function verifyRole (req, res){
    req.query.token = consume.consumeAuthMessage
    let token = req.query.token;
    let decodedToken = {};
    let decodedTokenA = { id: '', email: '', username: '', tel: '', nomE: '', emailE: '', domaineE: '', adresseE: ''};

    try {
        decodedToken = await jwt.verify(token, process.env.TOKEN);
        decodedTokenA = decodedToken.annonceur ? decodedToken.annonceur : decodedTokenA;
    } catch(err) {
        console.log(err);
        return res.status(400).json({ message: 'Unauthorized request' });
    }

    const email = decodedToken.email;
    console.log(email)
    const emailA = decodedTokenA.email;
    console.log(emailA)

    try {
        const adminsQuery = "SELECT * FROM admins WHERE email = ?";
        const annonceursQuery = "SELECT * FROM annonceurs WHERE email = ?";
        const [adminsRows, annonceursRows] = await Promise.all([
            db.query(adminsQuery, [email]),
            db.query(annonceursQuery, [emailA])
        ]);
        if (adminsRows.length > 0) {
            return res.status(200).json({ role: 'admin' });
        } else if (annonceursRows.length > 0) {
            const annonceurData = decodedToken;
            console.log (this.annonceurData)
            if (annonceurData.id && annonceurData.username && annonceurData.tel && annonceurData.nomE && annonceurData.emailE && annonceurData.domaineE && annonceurData.adresseE) {
                return res.status(200).json({ 
                    role: 'annonceur',
                    id: annonceurData.id,
                    username: annonceurData.username,
                    email: emailA,
                    tel: annonceurData.tel,
                    nomE: annonceurData.nomE,
                    emailE: annonceurData.emailE,
                    domaineE: annonceurData.domaineE,
                    adresseE: annonceurData.adresseE,
                });
            } else {
                return res.status(200).json({ role: 'annonceur'});
            }
        } else {
            return res.status(400).json({ message: 'User not found' });
        }
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    verifyRole
}
