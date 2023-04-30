require('dotenv').config();


const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.ENDPOINT;
const key = process.env.KEY;
const databaseId = process.env.DATABASEID;
const containerId = process.env.CONTAINERID;

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

async function connect() {
  const database = client.database(databaseId);
  const container = database.container(containerId);

  try {
    await client.databases.readAll().fetchAll();
    console.log('Connected to Cosmos DB account');
  } catch (err) {
    console.error('Failed to connect to Cosmos DB account', err);
  }
}
connect();
module.exports = { client, database, container };
