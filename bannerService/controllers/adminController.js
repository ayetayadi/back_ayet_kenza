const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect');
const { getReceivedToken } = require('../consume');
const { promisify } = require('util');
db.query = { promisify }.promisify(db.query);
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');


// Get All Banners bY nom Campagne
async function authoriserBanner(req, res) {
    try {
      const id_annonceur = req.decodedToken;
      const admin = req.params.email;
      const authoriserBanner = req.body.authoriserBanner;

      // Check if campagne exists and retrieve its id
      const campagneResult = await db.query('SELECT id FROM campagnes WHERE nom = ? AND id_annonceur = ?', [req.params.nom_campagne, id_annonceur]);
      if (campagneResult.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid campagne' });
      }
      const id_campagne = campagneResult[0].id;
  
      // Query CosmosDB to get all banners for the specified campagne
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.nom_campagne = @nom_campagne',
        parameters: [
          {
            name: '@nom_campagne',
            value: req.params.nom_campagne
          }
        ]
      };
      const { resources: banners } = await container.items.query(querySpec).fetchAll();
  
      // Pour chaque bannuère, afficher l'image from Blob Storage et l'ajouter à l'objet de la bannière
      const bannersWithImages = await Promise.all(
        banners.map(async (banner) => {
            const blobName = path.basename(banner.image);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const downloadBlockBlobResponse = await blockBlobClient.download();
            const buffer = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
            banner.image = buffer.toString('base64');
          return { ...banner };
        })
      );
  

      return res.status(200).json({ success: true, banners: bannersWithImages });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error retrieving banners from Cosmos DB' });
      
    }
  }
  

module.exports = {
    authoriserBanner
};