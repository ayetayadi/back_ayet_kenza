const amqp = require('amqplib');
const connectToRabbitMQ = require


async function publishAuthMessage(token) {
    try {
      const connection = await amqp.connect('amqp://localhost');
      console.log('Connected to RabbitMQ');
      connection.on('error', (err) => {
        console.error('Error connecting to RabbitMQ:', err);
      });
      const channel = await connection.createChannel();
      const exchange = 'auth_exchange';
      const routingKey = 'auth_token';
  
      await channel.assertExchange(exchange, 'direct', { durable: false });
      await channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify({ token })),
        { persistent: true }
      );
  
      console.log(`Token message published: ${token}`);
    } catch (error) {
      console.error('Error publishing token message:', error);
    }
  }


  module.exports = {
    publishAuthMessage
  }


module.exports = {
  publishAuthMessage
};