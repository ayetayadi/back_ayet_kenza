const amqp = require('amqplib');

async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    console.log('Connected to RabbitMQ');
    connection.on('error', (err) => {
      console.error('Error connecting to RabbitMQ:', err);
    });
    const channel = await connection.createChannel();
    const exchange = 'auth_exchange';
    const queue = 'account_queue';
    const routingKey = 'auth_token';

    await channel.assertExchange(exchange, 'direct', { durable: false });
    await channel.assertQueue(queue, { exclusive: false });
    await channel.bindQueue(queue, exchange, routingKey);

    return {
      connection,
      channel,
      exchange,
      routingKey
    };
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    throw error;
  }
}

module.exports = {
  connectToRabbitMQ
};
