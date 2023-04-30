
const connect = require('../config/rabbitmq');

async function publishAuthMessage(accessToken) {
    try {
      const connection = await connect();

      const channel = await connection.createChannel();
      const exchange = 'auth_exchange';
      const routingKey = 'auth_token';
  
      await channel.assertExchange(exchange, 'direct', { durable: false });
      await channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify({ accessToken })),
        { persistent: true }
      );
  
      console.log(`Auth Token message published: ${accessToken}`);
    } catch (error) {
      console.error('Error publishing Auth token message:', error);
    }
  }


  module.exports = {
    publishAuthMessage
  }


