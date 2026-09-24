const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const REQUIRED_VARS = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];

const missing = REQUIRED_VARS.filter(
  (name) => !process.env[name] || !process.env[name].trim()
);

if (missing.length > 0) {
  console.error(
    `[config] Missing required environment variables: ${missing.join(', ')}`
  );
  console.error('[config] Copy server/.env.example to server/.env and fill in the values.');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('[config] JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL,
});