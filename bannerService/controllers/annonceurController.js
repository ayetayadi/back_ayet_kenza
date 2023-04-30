const { BlobServiceClient } = require('@azure/storage-blob');
const { client, database, container } = require("../../config/cosmosdb");
const db = require('../../config/connect');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { generateHtmlCode } = require('../middlewares/bannerMiddleware');
const { getReceivedToken } = require('../consume');

// Set up multer storage for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new Banner
const createBannerWithImageUpload = (req, res, next) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error uploading image');
        }
        try {
            const id_annonceur = req.decodedToken;
            // Check if campagne exists and retrieve its id
            const campagneResult = await db.query('SELECT id FROM campagnes WHERE nom = ? AND id_annonceur', [req.body.nom_campagne, id_annonceur]);
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
                return res.status(400).json({ success: false, message: 'A banner with the same name already exists within the specified campagne' });
            }
    
    
            // Upload image file to Blob Storage and get its URL
            const file = req.file;
            if (!file) {
                return res.status(400).json({ success: false, message: 'No image uploaded' });
            }
    
            // Vérifier si une image a le même nom existe déjà dans le stockage Blob
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
            const containerName = process.env.CONTAINERNAME;
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobName = `${req.file.fieldname}-${Date.now()}${path.extname(req.file.originalname)}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const blobExists = await blockBlobClient.exists();
            let imageUrl;
            if (blobExists) {
                imageUrl = blockBlobClient.url;
            } else {
                // Upload image file to Blob Storage and get its URL
                await blockBlobClient.upload(req.file.buffer, req.file.buffer.length);
                imageUrl = blockBlobClient.url;
            }
    
            // Get image dimensions with sharp
            const imageBuffer = await sharp(file.buffer).metadata();
            const { width, height } = imageBuffer;
    
            // Générer code HTML for the banner
            const htmlcode = generateHtmlCode(req.body.title, req.body.subtitle, imageUrl, req.body.link);
    
            // Inserer banner dans CosmosDB
            const newBanner = {
                nom: req.body.nom,
                nom_campagne: req.body.nom_campagne,
                description: req.body.description || null,
                width, // use image width retrieved by sharp
                height, // use image height retrieved by sharp
                link: req.body.link,
                createdAt: (new Date().toISOString().replace(/:/g, "-")),
                updateAt: (new Date().toISOString().replace(/:/g, "-")),
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                title: req.body.title,
                subtitle: req.body.subtitle || null,
                htmlcode, // save generated HTML code to CosmosDB container
                status: req.body.status,
                placeholder: req.body.placeholder || null,
                image: imageUrl, // save image URL to CosmosDB container
                id_campagne: id_campagne
            };
    
    
            const { resource } = await container.items.create(newBanner);
            res.status(201).send("Created successfully!");
        } catch (err) {
            console.error(err);
            res.status(500).send("Error creating banner in Cosmos DB");
        }
    
    });
}

// Get All Banners bY nom Campagne
async function getAllBannersByCampagne(req, res) {
    try {
        const id_annonceur = req.decodedToken;
        const campagneResult = await db.query('SELECT id FROM campagnes WHERE nom = ? AND id_annonceur = ?', [req.params.nom_campagne, id_annonceur]);
        if (campagneResult.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid campagne' });
        }
        const id_campagne = campagneResult[0].id;

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

        const result = [];

        for (const banner of banners) {
            // Get the image blob from Blob Storage
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
            const containerName = process.env.CONTAINERNAME;
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobName = path.basename(banner.image);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const downloadBlockBlobResponse = await blockBlobClient.download();
            const buffer = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
            banner.image = buffer.toString('base64');

            result.push(banner);
        }

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error getting banners from Cosmos DB");
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

//Update Banner by ID
async function updateBannerById(req, res) {
    try {
        if (!req.params.id_banner) {
            return res.status(400).json({ success: false, message: 'Invalid banner' });
        }

        const querySpec = {
            query: 'SELECT * FROM c WHERE c.id = @id_banner',
            parameters: [
                { name: '@id_banner', value: req.params.id_banner }
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
        banner.updatedAt = req.body.updatedAt || banner.updatedAt;
        banner.htmlcode = req.body.htmlcode || banner.htmlcode;
        banner.placeholder = req.body.placeholder || banner.placeholder;
        banner.title = req.body.title || banner.title;
        banner.description = req.body.description || banner.description;
        banner.image = req.body.image || banner.image;

        // Replace the existing banner document in Cosmos DB
        const { resource: updatedBanner } = await container
            .item(banner.id, banner.partitionKey)
            .replace(banner);

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
            updatedBanner.image = buffer.toString('base64');
            // Update the banner document with the new base64-encoded image data
            container
                .item(updatedBanner.id, updatedBanner.partitionKey)
                .replace(updatedBanner)
                .then(() => {
                    res.status(200).json(updatedBanner);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).send("Error updating banner updating banner in Cosmos DB");
                })
        })
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating banner");
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








async function deleteBanner(req, res) {
    try {
        const nom = req.params.nom;

        // Delete banner record from Cosmos DB
        const querySpec = {
            query: 'SELECT TOP 1 c.id FROM c WHERE c.nom = @nom',
            parameters: [
                {
                    name: '@nom',
                    value: nom
                }
            ]
        };
        const { resources: banners } = await container.items.query(querySpec).fetchAll();
        if (banners.length === 0) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }
        const banner = banners[0];
        const { id } = banner;
        const { body: result } = await container.item(id, undefined).delete();

        // Delete banner blob from Azure Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const containerName = process.env.CONTAINERNAME;
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobName = banner.image.split('/').pop(); // extract blob name from image URL
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();

        return res.status(200).json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


// Delete a banner
async function deleteb(req, res) {
    try {
        const id = req.params.id;

        // Check if banner exists and retrieve its container item
        const { resource } = await container.item(id).read();
        if (!resource) {
            return res.status(400).json({ success: false, message: 'Banner not found' });
        }

        // Delete banner from Cosmos DB
        await container.item(id).delete();

        res.status(200).send("Deleted successfully!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting banner from Cosmos DB");
    }
}






module.exports = {
    createBannerWithImageUpload,
    getAllBannersByCampagne,
    getBannerById,
    updateBannerById,
    deleteBanner,
    deleteb
};