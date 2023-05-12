const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const util = require('util');
const { getReceivedToken } = require('../consume');
const { publishCampagneMessage } = require('../produce');
const shortid = require('shortid');

db.query = util.promisify(db.query);

const shortid = require('shortid');

const Konnect = require('konnect');
const konnectClient = new Konnect({
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

async function payer(req, res) {
    try {
        const id_annonceur = req.params.id;
        const id_offre = req.params.offreId;
        const username = req.body.username;
        const email = req.body.email;
        const tel = req.body.tel;

        // Validate input data
        if (!username || !email || !tel) {
            return res.status(400).json({ message: 'Missing required data' });
        }

        const paiementRef = shortid.generate(); 

        const connection = await db.getConnection();
        try {
            const sqlSearch = 'SELECT * FROM annonceurs WHERE id = ?';
            const searchQuery = mysql.format(sqlSearch, [id_annonceur]);
            const [annonceur] = await connection.query(searchQuery);
            if (annonceur.length === 0) {
                console.log(`Annonceur avec ID ${id_annonceur} n'existe pas`);
                return res.status(404).json({ message: `Annonceur avec ID ${id_annonceur} n'existe pas` });
            }

            const sqlSearchOffre = 'SELECT * FROM offres WHERE id = ?';
            const searchQueryOffre = mysql.format(sqlSearchOffre, [id_offre]);
            const [offre] = await connection.query(searchQueryOffre);
            if (offre.length === 0) {
                console.log(`Offre avec ID ${id_offre} n'existe pas`);
                return res.status(404).json({ message: `Offre avec ID ${id_offre} n'existe pas` });
            }

            if (username === annonceur[0].username && email === annonceur[0].email && tel === annonceur[0].tel) {
                const sqlInsert = "INSERT INTO paiements (id_annonceur, email, tel, datePaiement, refPaiement, montant) VALUES (?, ?, ?, NOW(), ?, ?)";
                const insert_query = mysql.format(sqlInsert, [id_annonceur, email, tel, paiementRef, offre[0].prixPack]);
                await connection.query(insert_query);
                console.log(`Annonceur payé`);
                return res.status(200).json({ message: `Annonceur payé` });
            } else {
                return res.status(400).json({ message: `Les informations d'annonceur ne correspondent pas` });
            }
        } finally {
            connection.release();
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}



module.exports = {
    payer
}