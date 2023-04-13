const amqp = require('amqplib');

let receivedToken;

async function consumeAuthMessage() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    console.log('Connected to RabbitMQ');

    const channel = await connection.createChannel();
    const exchange = 'auth_exchange';
    const routingKey = 'auth_token';

    await channel.assertExchange(exchange, 'direct', { durable: false });

    const { queue } = await channel.assertQueue('', { exclusive: true });
    console.log(`Consumer created, listening for messages on queue ${queue}`);

    await channel.bindQueue(queue, exchange, routingKey);

    channel.consume(queue, (message) => {
      const token = JSON.parse(message.content.toString()).token;
      console.log(`Received token message: ${token}`);
      receivedToken = token;

      // TODO: Handle the token message
    }, { noAck: true });
  } catch (error) {
    console.error('Error consuming token message:', error);
  }
}

consumeAuthMessage();

// Export the receivedToken variable as a function
function getReceivedToken() {
  return receivedToken;
}

module.exports = { getReceivedToken };
