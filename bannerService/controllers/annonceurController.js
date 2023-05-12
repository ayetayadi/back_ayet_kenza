const { BlobServiceClient } = require('@azure/storage-blob');
const { client, database, container, containerdef, containerdeff } = require("../../config/cosmosdb");
const { blobServiceClient, containerClient } = require("../../config/blobStorage");
const db = require('../../config/connect');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { generateHTMLCode } = require('../middlewares/bannerMiddleware');
const { getReceivedToken } = require('../consume');
const shortid = require('shortid');


// Set up multer storage for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function createBannerUpload(req, res) {
    try {
        const id_annonceur = req.decodedToken;
        // Check if campagne exists and retrieve its id
        const campagneResult = await db.query('SELECT id FROM campagnes WHERE nom = ? AND id_annonceur = ?', [req.params.nom_campagne, id_annonceur]);
        if (campagneResult.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid campagne' });
        }
        const id_campagne = campagneResult[0].id;

        const querySpec = {
            query: 'SELECT TOP 1 c.id FROM c WHERE c.nom = @nom AND c.nom_campagne = @nom_campagne',
            parameters: [
                {
                    name: '@nom',
                    value: req.body.nom
                },
                {
                    name: '@nom_campagne',
                    value: req.params.nom_campagne
                }
            ]
        };

        const { resources: existingBanners } = await container.items.query(querySpec).fetchAll();
        if (existingBanners.length > 0) {
            return res.status(400).json({ success: false, message: 'A banner with the same name déjà est dans la campagne' });
        }


        // Upload image file to Blob Storage and get its URL
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }
        const blobName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(file.buffer, file.buffer.length);
        const imageUrl = blockBlobClient.url;

        // Get image dimensions using sharp
        const imageBuffer = await sharp(file.buffer).metadata();
        const { width, height } = imageBuffer;

        // Generate HTML code for the banner
        const htmlcode = generateHTMLCode(req.body.callToAction, imageUrl);

        // Insert banner into CosmosDB
        const newBanner = {
            nom: req.body.nom,
            nom_campagne: req.params.nom_campagne,
            description: req.body.description || null,
            width, // use image width retrieved by sharp
            height, // use image height retrieved by sharp
            callToAction: req.body.callToAction,
            createdAt: (new Date().toISOString().replace(/:/g, "-")),
            updateAt: 'Pas de modification',
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            title: req.body.title,
            subtitle: req.body.subtitle || null,
            htmlcode, // save generated HTML code to CosmosDB container
            status: 'par téléchargement',
            placeholder: req.body.placeholder || null,
            plateformeType: req.body.plateformeType || null,
            image: imageUrl, // save image URL to CosmosDB container
            id_campagne: id_campagne,
            reportRef: shortid.generate(),
            statusPermission: 'en attente'
        };


        // Create the report for the newly created banner with random metrics
        const rapport = {
            nom: newBanner.nom,
            vues: Math.floor(Math.random() * 1000),
            clicks: Math.floor(Math.random() * 100),
            impressions: Math.floor(Math.random() * 5000),
            conversions: Math.floor(Math.random() * 10),
            startDate: newBanner.startDate,
            endDate: newBanner.endDate,
            startTime: newBanner.startTime,
            endTime: newBanner.endTime,
            id_banner: newBanner.id
        }
        const [createdBanner, createdContainerDef, createdContainerDeff] = await Promise.all([
            container.items.create(newBanner),
            containerdef.items.create(newBanner, { id_admin: 0 }),
            containerdeff.items.create(rapport)
        ]);


        return res.status(201).json({ success: true, message: 'Created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error creating banner in Cosmos DB' });
    }
}

// Route for handling banner creation with image upload
const createBannerWithImageUpload = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error upload image');
        }
        createBannerUpload(req, res, next);
    });
}

async function createBannerEditor(req, res) {
    try {
        const id_annonceur = req.decodedToken;
        // Check if campagne exists and retrieve its id
        const campagneResult = await db.query('SELECT id FROM campagnes WHERE nom = ? AND id_annonceur = ?', [req.params.nom_campagne, id_annonceur]);
        if (campagneResult.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid campagne' });
        }
        const id_campagne = campagneResult[0].id;

        const querySpec = {
            query: 'SELECT TOP 1 c.id FROM c WHERE c.nom = @nom AND c.nom_campagne = @nom_campagne',
            parameters: [
                {
                    name: '@nom',
                    value: req.body.nom
                },
                {
                    name: '@nom_campagne',
                    value: req.params.nom_campagne
                }
            ]
        };

        const { resources: existingBanners } = await container.items.query(querySpec).fetchAll();
        if (existingBanners.length > 0) {
            return res.status(400).json({ success: false, message: 'A banner with the same name déjà est dans la campagne' });
        }


        // Upload image file to Blob Storage and get its URL
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }
        const blobName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(file.buffer, file.buffer.length);
        const imageUrl = blockBlobClient.url;

        // Get image dimensions using sharp
        const imageBuffer = await sharp(file.buffer).metadata();
        const { width, height } = imageBuffer;

        // Generate HTML code for the banner
        const htmlcode = generateHTMLCode(req.body.callToAction, imageUrl);

        // Insert banner into CosmosDB
        const newBanner = {
            nom: req.body.nom,
            nom_campagne: req.params.nom_campagne,
            description: req.body.description || null,
            width, // use image width retrieved by sharp
            height, // use image height retrieved by sharp
            callToAction: req.body.callToAction,
            createdAt: (new Date().toISOString().replace(/:/g, "-")),
            updateAt: (new Date().toISOString().replace(/:/g, "-")),
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            title: req.body.title,
            subtitle: req.body.subtitle || null,
            htmlcode, // save generated HTML code to CosmosDB container
            status: 'par éditeur',
            placeholder: req.body.placeholder || null,
            plateformeType: req.body.plateformeType || null,
            image: imageUrl, // save image URL to CosmosDB container
            id_campagne: id_campagne,
            reportRef: shortid.generate(),
            statusPermission: 'en attente'
        };

        // Create the report for the newly created banner with random metrics
        const rapport = {
            nom: newBanner.nom,
            vues: Math.floor(Math.random() * 1000),
            clicks: Math.floor(Math.random() * 100),
            impressions: Math.floor(Math.random() * 5000),
            conversions: Math.floor(Math.random() * 10),
            startDate: newBanner.startDate,
            endDate: newBanner.endDate,
            startTime: newBanner.startTime,
            endTime: newBanner.endTime,
            id_banner: newBanner.id
        }
        const [createdBanner, createdContainerDef, createdContainerDeff] = await Promise.all([
            container.items.create(newBanner),
            containerdef.items.create(newBanner, { id_admin: 0 }),
            containerdeff.items.create(rapport)
        ]);


        const { resource } = await container.items.create(newBanner);

        return res.status(201).json({ success: true, message: 'Created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error creating banner in Cosmos DB' });
    }
}

const createBannerWithEditor = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving image');
        }
        createBannerEditor(req, res, next);
    });
}

// Get All Banners bY nom Campagne
async function getAllBannersByCampagne(req, res) {
    try {
        const id_annonceur = req.decodedToken;

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

        // Pour chaque bannière, afficher l'image from Blob Storage et l'ajouter à l'objet de la bannière
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

async function getAllBannersByAnnonceur(req, res) {
    try {
      const id_annonceur = req.decodedToken;
  
      // Get all campaigns for the specified advertiser
      const campaignsResult = await db.query('SELECT id, nom FROM campagnes WHERE id_annonceur = ?', [id_annonceur]);
  
      // Loop through each campaign and get its banners
      const bannersWithImages = await Promise.all(
        campaignsResult.map(async (campaign) => {
          // Query CosmosDB to get all banners for the current campaign
          const querySpec = {
            query: 'SELECT * FROM c WHERE c.nom_campagne = @nom_campagne',
            parameters: [
              {
                name: '@nom_campagne',
                value: campaign.nom
              }
            ]
          };
          const { resources: banners } = await container.items.query(querySpec).fetchAll();
  
          // Pour chaque bannière, afficher l'image from Blob Storage et l'ajouter à l'objet de la bannière
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
  
          return bannersWithImages;
        })
      );
  
      // Concatenate all the banners into a single array
      const allBanners = bannersWithImages.flat();
  
      return res.status(200).json({ success: true, banners: allBanners });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error retrieving banners from Cosmos DB' });
    }
  }

  
async function getAllBanners(req, res) {
    try {
        const id_annonceur = req.decodedToken;

        // Check if campagne exists and retrieve its id
        const campagneResult = await db.query('SELECT id FROM campagnes WHERE id_annonceur = ?', [id_annonceur]);
        if (campagneResult.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid campagne' });
        }
        const id_campagne = campagneResult[0].id;

        // Query CosmosDB to get all banners for the specified campagne
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.id_campagne = @id_campagne',
            parameters: [
                {
                    name: '@id_campagne',
                    value: id_campagne
                }
            ]
        };
        const { resources: banners } = await container.items.query(querySpec).fetchAll();

        // Pour chaque bannière, afficher l'image from Blob Storage et l'ajouter à l'objet de la bannière
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



//Get Banner by ID
async function getBannerById(req, res) {
    try {
        if (!req.params.id_banner) { // check if banner exists with its id
            return res.status(400).json({ success: false, message: 'Invalid banner' });
        }

        const querySpec = {
            query: 'SELECT * FROM c WHERE c.id = @id_banner',
            parameters: [
                { name: '@id_banner', value: req.params.id_banner }
            ]
        };


        const { resources } = await container.items.query(querySpec).fetchAll(); // execute the query and get the result
        if (resources.length === 0) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }
        const banner = resources[0];

        // Get the image blob from Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const containerName = process.env.CONTAINERNAME;
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobName = path.basename(banner.image);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadBlockBlobResponse = await blockBlobClient.download();

        // Instead of buffering the entire image, use a streaming approach to convert it to base64
        const chunks = [];
        downloadBlockBlobResponse.readableStreamBody.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        downloadBlockBlobResponse.readableStreamBody.on("end", () => {
            const buffer = Buffer.concat(chunks);
            banner.image = buffer.toString('base64');
            res.status(200).json(banner);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error getting banner from Cosmos DB");
    }
}


async function updateBanner(req, res) {
    try {
        const id_annonceur = req.decodedToken;
        // Check if campagne exists and retrieve its id
        const campagneResult = await db.query('SELECT id FROM campagnes WHERE nom = ? AND id_annonceur = ?', [req.params.nom_campagne, id_annonceur]);
        if (campagneResult.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid campagne' });
        }
        const id_campagne = campagneResult[0].id;

        const querySpec = {
            query: 'SELECT TOP 1 c.id FROM c WHERE c.nom = @nom AND c.nom_campagne = @nom_campagne',
            parameters: [
                {
                    name: '@nom_campagne',
                    value: req.params.nom_campagne
                },
                {
                    name: '@nom',
                    value: req.params.nom
                }
            ]
        };

        const { resources: banners } = await container.items.query(querySpec).fetchAll();
        if (banners.length === 0) {
            return res.status(400).json({ success: false, message: 'Bannière nexiste pas' });
        }

        const banner = banners[0];

        // Check if a new image file is uploaded
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        // Delete the old blob from Blob Storage
        const oldBlobUrl = banner.image;
        const oldBlobName = path.basename(oldBlobUrl);
        const oldContainerName = oldBlobUrl.split('/')[3];
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const oldContainerClient = blobServiceClient.getContainerClient(oldContainerName);
        await oldContainerClient.deleteBlob(oldBlobName);


        // Upload the new image file to Blob Storage
        const newBlobName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
        const newBlockBlobClient = containerClient.getBlockBlobClient(newBlobName);
        await newBlockBlobClient.upload(file.buffer, file.buffer.length);
        const newImageUrl = newBlockBlobClient.url;

        // Update the image URL in the banner object
        banner.image = newImageUrl;


        // Update other properties of the banner object

        banner.nom = req.body.nom;



        if (req.body.description) {
            banner.description = req.body.description;
        }
        if (req.body.callToAction) {
            banner.callToAction = req.body.callToAction;
        }
        if (req.body.startDate) {
            banner.startDate = req.body.startDate;
        }
        if (req.body.endDate) {
            banner.endDate = req.body.endDate;
        }
        if (req.body.title) {
            banner.title = req.body.title;
        }
        if (req.body.subtitle) {
            banner.subtitle = req.body.subtitle;
        }
        if (req.body.placeholder) {
            banner.placeholder = req.body.placeholder;
        }
        if (req.body.plateformeType) {
            banner.plateformeType = req.body.plateformeType;
        }

        banner.updatedAt = new Date().toISOString().replace(/:/g, "-");

        banner.htmlcode = generateHTMLCode(req.body.callToAction, imageUrl);

        // Get image dimensions using sharp
        const imageBuffer = await sharp(file.buffer).metadata();
        const { width, height } = imageBuffer;

        banner.width = width;
        banner.height = height;

        // Replace existing banner document in Cosmos DB
        const { resource: updatedBanner } = await container.item(banner.id, banner.nom).replace(banner);

        res.status(200).json(updatedBanner);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error updating banner' });
    }

}


async function updateBannerById(req, res) {
    try {
        const id_banner = req.params.id_banner;
        if (!id_banner) {
            return res.status(400).json({ success: false, message: 'Invalid banner ID' });
        }

        const querySpec = {
            query: 'SELECT * FROM c WHERE c.id = @id_banner',
            parameters: [
                { name: '@id_banner', value: id_banner }
            ]
        };

        const { resources } = await container.items.query(querySpec).fetchAll();
        if (resources.length === 0) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        const banner = resources[0];

        // Update banner properties
        banner.nom = req.body.nom || banner.nom;
        banner.subtitle = req.body.subtitle || banner.subtitle;
        banner.createdAt = req.body.createdAt || banner.createdAt;
        banner.updatedAt = new Date().toISOString();
        banner.htmlcode = req.body.htmlcode || banner.htmlcode;
        banner.placeholder = req.body.placeholder || banner.placeholder;
        banner.title = req.body.title || banner.title;
        banner.description = req.body.description || banner.description;
        banner.callToAction = req.body.callToAction || banner.callToAction;
        banner.status = req.body.status || banner.status;
        banner.startDate = req.body.startDate || banner.startDate;
        banner.endDate = req.body.endDate || banner.endDate;
        banner.statusPermission = req.body.statusPermission || banner.statusPermission;

        // Validate input data
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file uploaded' });
        }
        const file = req.file;
        if (!file.originalname) {
            return res.status(400).json({ success: false, message: 'Invalid image file name' });
        }

        // Extract container and blob names from old image URL
        const oldImageUrl = banner.image;
        const regex = /https:\/\/(.+)\.blob\.core\.windows\.net\/(.+)\/(.+)/;
        const matches = oldImageUrl.match(regex);
        if (!matches || matches.length < 4) {
            return res.status(400).json({ success: false, message: 'Invalid image URL format' });
        }
        const oldContainerName = matches[2];
        const oldBlobName = matches[3];

        // Delete old blob from Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const oldContainerClient = blobServiceClient.getContainerClient(oldContainerName);
        await oldContainerClient.deleteBlob(oldBlobName);

        // Upload new image to Blob Storage
        const containerName = process.env.CONTAINERNAME;
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobName = file.originalname;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(file.buffer, file.size);

        // Update banner image URL in Cosmos DB
        const newImageUrl = `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${containerName}/${blobName}`;
        banner.image = newImageUrl;

        // Replace existing banner document in Cosmos DB
        const { resource: updatedBanner } = await container.item(banner.id, banner.nom).replace(banner);

        res.status(200).json(updatedBanner);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating banner' });
    }
}



async function deleteBanner(req, res) {
    try {
        const id_annonceur = req.decodedToken;
        const campagneResult = await db.query('SELECT id FROM campagnes WHERE nom = ? AND id_annonceur = ?', [req.params.nom_campagne, id_annonceur]);
        if (campagneResult.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid campagne' });
        }
        const id_campagne = campagneResult[0].id;

        const querySpec = {
            query: 'SELECT * FROM c WHERE c.nom_campagne = @nom_campagne AND c.nom = @nom',
            parameters: [
                {
                    name: '@nom_campagne',
                    value: req.params.nom_campagne
                },
                {
                    name: '@nom',
                    value: req.params.nom
                }
            ]
        };

        const { resources: banners } = await container.items.query(querySpec).fetchAll();
        if (banners.length === 0) {
            return res.status(400).json({ success: false, message: `Bannière ${req.params.nom} n'existe pas` });
        }

        const banner = banners[0];

        // Get the blob name and container name from the current banner image URL
        const oldBlobUrl = banner.image;
        const oldBlobName = path.basename(oldBlobUrl);
        const oldContainerName = oldBlobUrl.split('/')[3];

        // Delete the old blob from Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const oldContainerClient = blobServiceClient.getContainerClient(oldContainerName);
        await oldContainerClient.deleteBlob(oldBlobName);

        // Delete banner from Cosmos DB
        await container.item(banner.id, banner.nom).delete();

        return res.status(200).json({ success: true, message: 'Bannière est supprimée avec succés' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur de la suppression de bannière!!' });
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

async function getRapportByBanner(req, res) {
    try {
        // Query CosmosDB to get all banners for the specified campagne
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.nom_campagne = @nom_campagne AND c.nom = @nom',
            parameters: [
                {
                    name: '@nom_campagne',
                    value: req.params.nom_campagne
                },
                {
                    name: '@nom',
                    value: req.params.nom
                }
            ]
        };
        const { resources } = await container.items.query(querySpec).fetchAll(); // execute the query and get the result
        if (resources.length === 0) {
            return res.status(404).json({ success: false, message: `Rapport for ${req.params.nom_campagne} and ${req.params.nom} not found` });
        }
        const banner = resources[0];

        // Query CosmosDB to get all the reports for the retrieved banner
        const querySpecRapport = {
            query: 'SELECT * FROM r WHERE r.nom = @nom',
            parameters: [
                {
                    name: '@nom',
                    value: banner.nom
                }
            ]
        };
        const { resources: rapports } = await containerdeff.items.query(querySpecRapport).fetchAll(); // execute the query and get the result

        // Return the reports
        return res.status(200).json({ success: true, rapports });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error retrieving banners from Cosmos DB' });
    }
}



module.exports = {
    createBannerWithImageUpload,
    createBannerWithEditor,
    getAllBannersByCampagne,
    getBannerById,
    updateBanner,
    updateBannerById,
    deleteBanner,
    getAllBanners,
    getAllBannersByAnnonceur,
    getRapportByBanner
};