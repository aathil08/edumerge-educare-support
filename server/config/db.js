const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('[db] MongoDB reconnected');
  });

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`[db] MongoDB connected (database: ${mongoose.connection.name})`);
}

module.exports = connectDB;