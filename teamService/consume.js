const connect = require('../config/rabbitmq');

let receivedToken;

async function consumeAuthMessage() {
  try {
    const connection = await connect();


    const channel = await connection.createChannel();
    const exchange = 'auth_exchange';
    const routingKey = 'auth_token';

    await channel.assertExchange(exchange, 'direct', { durable: false });

    const { queue } = await channel.assertQueue('', { exclusive: true });

    await channel.bindQueue(queue, exchange, routingKey);

    channel.consume(queue, (message) => {
      const accessToken = JSON.parse(message.content.toString()).accessToken;
      console.log(`Received auth token message: ${accessToken}`);
      receivedToken = accessToken;

      // TODO: Handle the token message
    }, { noAck: true });
  } catch (error) {
    console.error('Error consuming auth token message:', error);
  }
}

consumeAuthMessage();

// Export the receivedToken variable as a function
function getReceivedToken() {
  return receivedToken;
}

module.exports = { getReceivedToken };
