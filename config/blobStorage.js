const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.CONTAINERNAME;

function createBlobServiceClient(connectionString, containerName) {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    console.log('Connected to Azure Blob Storage');
    return { blobServiceClient, containerClient };
  } catch (err) {
    console.error('Failed to connect to Azure Blob Storage:', err);
    process.exit(1);
  }
}

const { blobServiceClient, containerClient } = createBlobServiceClient(connectionString, containerName);

module.exports = { blobServiceClient, containerClient };

