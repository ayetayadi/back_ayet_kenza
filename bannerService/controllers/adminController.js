const { BlobServiceClient } = require('@azure/storage-blob');
const { client, database, container, containerdef } = require("../../config/cosmosdb");
const { blobServiceClient, containerClient } = require("../../config/blobStorage");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { generateHTMLCode } = require('../middlewares/bannerMiddleware');
const { getReceivedToken } = require('../consume');
const { promisify } = require('util');
const Cookies = require('js-cookie');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');
db.query = { promisify }.promisify(db.query);

// Set up multer storage for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/*
async function authoriserBanner(req, res) {
  const id_admin = req.decodedToken;
  const nomBanner = req.params.nom;
  const authoriserBanner = req.body.authoriserBanner;

  // Validate input
  if (typeof authoriserBanner !== 'boolean' || !nomBanner) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  const querySpec = {
    query: 'SELECT * FROM c WHERE c.nom = @nom',
    parameters: [
      {
        name: '@nom',
        value: nomBanner,
      },
    ],
  };

  try {
    const { resources: existingBanners } = await container.items.query(querySpec).fetchAll();
    if (existingBanners.length === 0) {
      return res.status(400).json({ success: false, message: `La bannière ${nomBanner} n'existe pas` });
    }

    const banner = existingBanners[0];
    const newStatus = authoriserBanner ? 'Approuvée' : 'Refusée';

    banner.statusPermission = authoriserBanner;

    const { resource: updatedBanner } = await container
      .item(banner.id, banner.nom)
      .replace(banner);

    // Insert new authorization record
    db.getConnection(async (err, connection) => {
      if (err) throw (err);
      const sqlInsert = 'INSERT INTO autorisations (status, nom_banniere, id_admin) VALUES (?, ?, ?)';
      const insert_query = mysql.format(sqlInsert, [newStatus, nomBanner, id_admin]);
      await connection.query(insert_query, async (err, result) => {
        if (err) {
          console.error('Error inserting authorization in MySQL:', err);
          res.status(500).json({ success: false, message: 'Error inserting authorization in MySQL' });
        } else {
          res.json({ success: true, message: `La bannière ${nomBanner} a été autorisée` });
        }
      });
    })
  } catch (err) {
    console.error('Error retrieving or updating banner:', err);
    res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
}*/

async function authoriserBanner(req, res) {
  const id_admin = req.decodedToken;
  const bannerName = req.params.nom;
  const isAuthorized = req.body.isAuthorized;

  // Validate input
  if (typeof isAuthorized !== 'boolean' || !bannerName) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  try {
    // Get the banner document
    const querySpec = {
      query: 'SELECT * FROM a WHERE a.nom = @nom',
      parameters: [
        {
          name: '@nom',
          value: bannerName
        }
      ]
    };
    const { resources: banner } = await containerdef.items.query(querySpec).fetchAll();
    if (!banner || banner.length === 0) {
      return res.status(400).json({ success: false, message: `Banner ${bannerName} not found` });
    }

    // Update the autorisations document
    const autorisationsQuerySpec = {
      query: 'SELECT * FROM a WHERE a.nom = @nom',
      parameters: [
        {
          name: '@nom',
          value: bannerName
        }
      ]
    };
    const { resources: autorisations } = await containerdef.items.query(autorisationsQuerySpec).fetchAll();

    if (!autorisations || autorisations.length === 0) {
      return res.status(400).json({ success: false, message: `Autorisations for banner ${bannerName} not found` });
    }

    const autorisation = autorisations[0];

    const updatedAutorisation = {
      ...autorisation,
      statusPermission: isAuthorized ? 'acceptée' : 'refusée',
      id_admin: id_admin
    };

    const updatedBanner = {
      ...autorisation,
      statusPermission: isAuthorized ? 'acceptée' : 'refusée'
        };


    const { resource:update1 } = await containerdef.item(updatedAutorisation.id, updatedAutorisation.nom).replace(updatedAutorisation);

    const campagneResult = await db.query('SELECT id_annonceur FROM campagnes WHERE id = ?', [autorisations[0].id_campagne]);
    if (campagneResult.length === 0) {
      return res.status(400).json({ success: false, message: `Pas d'annonceur dans ce campagne ${autorisations[0].id_campagne}` });
    }
    const id_annonceur = campagneResult[0].id_annonceur;

    const annonceurResult = await db.query('SELECT email FROM annonceurs WHERE id = ?', [id_annonceur]);
    if (annonceurResult.length === 0) {
      return res.status(400).json({ success: false, message: `Pas d'annonceur avec id ${id_annonceur}` });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: annonceurResult[0].email,
      subject: 'Autorisation de votre bannière',
      html: `
        <p>Votre bannière ${autorisations[0].nom} de la campagne publicitaire ${autorisations[0].nom_campagne} est ${updatedAutorisation.statusPermission} pour être publiée dans Ijeni</p>
        <p>Cordialement,</p>
      `
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal server error');
      } else {
        res.send({ message: `Autorisation envoyée avec succès à ${annonceurResult[0].email}` });
      }
    })

  } catch (err) {
    console.error('Error updating banner:', err);
    res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
}



async function getAllBannersAuthorisationsByAnnonceur(req, res) {
  try {

    const nom_campagne = req.params.nom;
    const AnnonceurEmail = req.params.email;
    console.log(`Getting banners for ${nom_campagne} for annonceur with email ${AnnonceurEmail}`);

    const campagneResult = await db.query('SELECT id_annonceur FROM campagnes WHERE nom = ?', [nom_campagne]);
    if (campagneResult.length === 0) {
      return res.status(400).json({ success: false, message: `Pas d'annonceur dans ce campagne ${nom_campagne}` });
    }
    const id_annonceur = campagneResult[0].id_annonceur;

    const annonceurResult = await db.query('SELECT email FROM annonceurs WHERE id = ?', [id_annonceur]);
    if (annonceurResult.length === 0) {
      return res.status(400).json({ success: false, message: `Pas d'annonceur avec email ${annonceurResult[0].email}` });
    }
    if (AnnonceurEmail !== annonceurResult[0].email) {
      console.log(`Unauthorized request for annonceur with email ${AnnonceurEmail}`);
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    }   
    console.log(`Fetching banners for ${nom_campagne} from Cosmos DB`);

       // Query CosmosDB to get all banners for the specified campagne
      const querySpec = {
          query: 'SELECT * FROM a WHERE a.nom_campagne = @nom_campagne',
          parameters: [
              {
                  name: '@nom_campagne',
                  value: nom_campagne
              }
          ]
      };
      const { resources: autorisations } = await containerdef.items.query(querySpec).fetchAll();

      // Pour chaque bannière, afficher l'image from Blob Storage et l'ajouter à l'objet de la bannière
      const autorizedbannersWithImages = await Promise.all(
          autorisations.map(async (autorisation) => {
              const blobName = path.basename(autorisation.image);
              const blockBlobClient = containerClient.getBlockBlobClient(blobName);
              const downloadBlockBlobResponse = await blockBlobClient.download();
              const buffer = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
              autorisation.image = buffer.toString('base64');
              return { ...autorisation };
          })
      );

      return res.status(200).json({ success: true, autorisations: autorizedbannersWithImages });
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error retrieving banners from Cosmos DB' });
  }
}

// Helper function to convert stream to buffer
function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

module.exports = {
  authoriserBanner,
  getAllBannersAuthorisationsByAnnonceur
};