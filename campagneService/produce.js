
const connect = require('../config/rabbitmq');

async function publishCampagneMessage(id, nom) {
    try {
      const connection = await connect();
  
      const channel = await connection.createChannel();
      const exchange = 'campagne_exchange';
      const routingKey = `campagne.${id}.${nom}`;
  
      await channel.assertExchange(exchange, 'direct', { durable: false });
      await channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify({ id, nom })),
        { persistent: true }
      );
  
      console.log(`Campagne message published: ${id} - ${nom}`);
    } catch (error) {
      console.error('Error publishing Campagne message:', error);
    }
  }
  
  module.exports = {
    publishCampagneMessage
  };
  