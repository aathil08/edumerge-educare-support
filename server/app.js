const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(express.json({ limit: '10kb' }));
if (!env.isProduction) app.use(morgan('dev'));

// Health check: confirms the server is up and reports DB state.
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    data: {
      status: 'ok',
      database: states[mongoose.connection.readyState] || 'unknown',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;