const Redis = require('redis');
require('dotenv').config();

const client = Redis.createClient({
  url: process.env.REDIS_URL,
  socket: { reconnectStrategy: retries => Math.min(retries * 100, 3000) }
});

client.on('connect', () => console.log('Redis Connected'));
client.on('error', (err) => console.error('Redis Error', err));
client.connect().catch(console.error);

module.exports = client;