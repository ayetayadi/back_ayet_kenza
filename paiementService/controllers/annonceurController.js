const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const util = require('util');
const shortid = require('shortid');
const axios = require('axios');

db.query = util.promisify(db.query);

async function payementwithFlouci(req, res) {
    const url = 'https://developers.flouci.com/api/generate_payment';
    const payload = {
        app_token: '04476efb-4e34-482c-a301-7efb55f27e4e',
        app_secret: process.env.FLOUCI_SECRET,
        accept_card: true,
        amount: req.body.amount,
        success_link: 'http://localhost:4200',
        fail_link: 'http://localhost:4200/pages-error404',
        session_timeout_secs: 1200,
        developer_tracking_id: 'e23dfa48-3913-42f4-85e5-60618bd24129'
    };

    try {
        const response = await axios.post(url, payload);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}

async function verify(req, res) {
    const id_payement = req.params.id;
    const url = `https://developers.flouci.com/api/verify_payment/${id_payement}`

    await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            'apppublic': '04476efb-4e34-482c-a301-7efb55f27e4e',
            'appsecret': process.env.FLOUCI_SECRET
        }
    })
        .then(result => {
            res.send(result.data)
        })
        .catch(error => {
            console.log(error.message)
        })

}

async function payement(req, res) {
    const email = req.params.email;
    const id_offre = req.params.offreId;
    const paiementRef = shortid.generate();

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred');
        }

        try {
            const sqlSearch = 'SELECT * FROM annonceurs WHERE email = ?';
            const searchQuery = mysql.format(sqlSearch, [email]);

            connection.query(searchQuery, async (err, annonceur) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Failed to fetch annonceur from database');
                }
                if (!annonceur.length) {
                    console.log(`Annonceur avec email ${email} n'existe pas`);
                    return res.status(404).json({ message: `Annonceur avec email ${email} n'existe pas` });
                }

                const id = annonceur[0].id;
                const username = annonceur[0].username;
                const tel = annonceur[0].tel;

                const sqlSearchOffre = 'SELECT * FROM offres WHERE id = ?';
                const searchQueryOffre = mysql.format(sqlSearchOffre, [id_offre]);

                connection.query(searchQueryOffre, async (err, offre) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Failed to fetch offre from database');
                    }
                    if (!offre.length) {
                        console.log(`Offre avec ID ${id_offre} n'existe pas`);
                        return res.status(404).json({ message: `Offre avec ID ${id_offre} n'existe pas` });
                    }

                    if (id === annonceur[0].id && username === annonceur[0].username && tel === annonceur[0].tel) {
                        const sqlInsert =
                            'INSERT INTO paiements (username_annonceur, email_annonceur, tel_annonceur, datePaiement, refPaiement, montant, id_annonceur, id_offre) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)';

                        const insert_query = mysql.format(sqlInsert, [
                            username,
                            email,
                            tel,
                            paiementRef,
                            offre[0].prixPack,
                            id,
                            id_offre,
                        ]);

                        connection.query(insert_query, (err) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).send('Failed to insert payment into database');
                            }
                            console.log(`Annonceur payé`);
                            generateFacture(req, res, id);

                            const sqlUpdate = 'UPDATE annonceurs SET typeOffre=? WHERE email = ?';
                            const updateQuery = mysql.format(sqlUpdate, [offre[0].nomPack, email]);
                            connection.query(updateQuery, async (err, result) => {
                                if (err) throw err;
                                console.log(`Annonceur avec email ${email} est mis à jour`);
                            });

                            return res.status(200).json({ message: `Annonceur payé` });
                        });
                    } else {
                        return res.status(400).json({ message: `Les informations d'annonceur ne correspondent pas` });
                    }
                });
            });
        } finally {
            connection.release();
        }
    });
}

async function generateFacture(req, res, id) {
    const num_facture = shortid.generate();

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred');
        }

        try {
            const sqlSearchPaiement = 'SELECT * FROM paiements WHERE id_annonceur = ?';
            const searchQueryPaiement = mysql.format(sqlSearchPaiement, [id]);

            connection.query(searchQueryPaiement, async (err, paiement) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Failed to fetch paiement from database');
                }
                if (!paiement.length) {
                    console.log(`Paiement avec ID de l'annonceur ${id} n'existe pas`);
                    return res.status(404).json({ message: `Paiement avec ID de l'annonceur ${id} n'existe pas` });
                }

                const username = paiement[0].username_annonceur;
                const email = paiement[0].email_annonceur;
                const tel = paiement[0].tel_annonceur;
                const refPaiement = paiement[0].refPaiement;
                const montant = paiement[0].montant;
                const id_offre = paiement[0].id_offre;
                const id_paiement = paiement[0].id;

                const sqlSearchOffre = 'SELECT nomPack FROM offres WHERE id = ?';
                const searchQueryOffre = mysql.format(sqlSearchOffre, [id_offre]);

                connection.query(searchQueryOffre, async (err, offre) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Failed to fetch offres from database');
                    }
                    if (!offre.length) {
                        console.log(`Offre avec ID ${id_offre} n'existe pas`);
                        return res.status(404).json({ message: `Offre avec ID ${id_offre} n'existe pas` });
                    }

                    if (username === paiement[0].username_annonceur && tel === paiement[0].tel_annonceur) {
                        const prixdt = parseFloat(montant);
                        const tva = parseFloat(14);
                        const total = parseFloat((prixdt + prixdt * (tva/100)).toFixed(2));

                        const sqlInsert =
                            `INSERT INTO factures (num_facture, nom_offre, refPaiement, prixdt, tva, total, email_annonceur, username_annonceur, tel_annonceur, id_paiement, date_paiement, dateFin_paiement)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH));`

                        const insert_query = mysql.format(sqlInsert, [
                            num_facture,
                            offre[0].nomPack,
                            refPaiement,
                            prixdt,
                            tva,
                            total,
                            email,
                            username,
                            tel,
                            id_paiement,
                        ]);

                        connection.query(insert_query, (err) => {
                            if (err) {
                                console.error(err);
                            }

                            console.log(`Facture générée`);
                        });
                    } else {
                        return res.status(400).json({ message: `Erreur de générer la facture` });
                    }
                });
            });
        } finally {
            connection.release();
        }
    });
}

async function voirFactures(req, res) {
    const email_annonceur = req.decodedToken;
    db.getConnection(async (err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to connect to database');
        }
        const sqlSearchFacture = 'SELECT * FROM factures WHERE email_annonceur = ?';
        const searchQueryFacture = mysql.format(sqlSearchFacture, [email_annonceur]);

        connection.query(searchQueryFacture, (err, facture) => {
            if (err) {
                console.error(err);
                reject('Failed to fetch facture from database');
            }
            if (!facture.length) {
                console.log(`Facture de ${email_annonceur} n'existe pas`);
                return res.status(500).send(`Facture de ${email_annonceur} n'existe pas`);
            }
            res.send(facture);
        });
    });
}



module.exports = {
    payementwithFlouci,
    verify,
    payement,
    voirFactures
}