const { connectToRabbitMQ } = require('../config/rabbitmq');

async function consumeAuthMessage() {
    return new Promise(async (resolve, reject) => {
        try {
            const { channel, exchange, queue, routingKey } = await connectToRabbitMQ();

            await channel.assertExchange(exchange, 'direct', { durable: false });
            await channel.assertQueue(queue, { exclusive: false });
            await channel.bindQueue(queue, exchange, routingKey);

            channel.consume(queue, async (message) => {
                try {
                    const data = JSON.parse(message.content.toString());
                    const token = data.token;
                    console.log(`Received token message: ${token}`);

                    // Stop consuming messages
                    await channel.close();
                    await connection.close();
                    resolve(token);
                } catch (error) {
                    console.error('Error parsing token message:', error);
                    reject(error);
                }
            }, { noAck: true });

            console.log('Waiting for token messages...');
        } catch (error) {
            console.error('Error consuming token message:', error);
            reject(error);
        }
    });
}

module.exports = {
    consumeAuthMessage
}
