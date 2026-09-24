const env = require('./config/env'); // must be first: validates environment
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`[server] EduCare API running on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  console.error('[process] Unhandled rejection:', reason);
});

start();