const mysql = require('mysql');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const util = require('util');
db.query = util.promisify(db.query);
const { getReceivedToken } = require('../consume');
const { publishAccountMessage } = require('../produce');


async function verifyRole (req, res){
    console.log(`The received token is: ${getReceivedToken()}`);
    let token1 = getReceivedToken()
    console.log(`token1 ${token1}`);
    let token = token1;
    console.log(`token ${token}`);
    let decodedToken = {};
    let decodedTokenA = { id: '', email: '', username: '',dateNaiss: '', tel: '', nomE: '', emailE: '',telE:'', domaineE: '', adresseE: ''};
    let decodedTokenAd = { id: '', email: ''};

    try {
        decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        decodedTokenA = decodedToken.annonceur ? decodedToken.annonceur : decodedTokenA;
        decodedTokenAd = decodedToken.admin ? decodedToken.admin : decodedTokenA;

    } catch(err) {
        console.log(err);
        return res.status(400).json({ message: 'Unauthorized request' });
    }

    const email = decodedTokenAd.email;
    console.log(`email de l'admin: `+email)
    const emailA = decodedTokenA.email;
    console.log(`email de l'annonceur: `+emailA)

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
            if (annonceurData.id && annonceurData.username && annonceurData.dateNaiss && annonceurData.tel && annonceurData.nomE && annonceurData.emailE &&annonceurData.telE && annonceurData.domaineE && annonceurData.adresseE) {
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


async function getToken (req, res){
    console.log(`The received token is: ${getReceivedToken()}`);
    let token1 = getReceivedToken()
    console.log(`token1 ${token1}`);
    let token = token1;
    console.log(`token ${token}`);
    let decodedToken = {};
    let decodedTokenA = { id: '', email: '', username: '',dateNaiss: '', tel: '', nomE: '', emailE: '',telE:'', domaineE: '', adresseE: ''};

    try {
        decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        decodedTokenA = decodedToken.annonceur ? decodedToken.annonceur : decodedTokenA;
    } catch(err) {
        console.log(err);
        return res.status(400).json({ message: 'Unauthorized request' });
    }

    const email = decodedToken.email;
    console.log(`email de l'admin: `+email)
    const emailA = decodedTokenA.email;
    console.log(`email de l'annonceur: `+emailA)

    try {
        const adminsQuery = "SELECT * FROM admins WHERE email = ?";
        const annonceursQuery = "SELECT * FROM annonceurs WHERE email = ?";
        const [adminsRows, annonceursRows] = await Promise.all([
            db.query(adminsQuery, [email]),
            db.query(annonceursQuery, [emailA])
        ]);
        if (adminsRows.length > 0) {
            publishAccountMessage(token);
            return res.status(200).json({ role: 'admin' , token: token});
        } else if (annonceursRows.length > 0) {
            const annonceurData = decodedToken;
            if (annonceurData.id && annonceurData.username && annonceurData.dateNaiss && annonceurData.tel && annonceurData.nomE && annonceurData.emailE &&annonceurData.telE && annonceurData.domaineE && annonceurData.adresseE) {
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
                publishAccountMessage(token);
                return res.status(200).json({ role: 'annonceur', token: token});
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
    verifyRole,
    getToken
}
