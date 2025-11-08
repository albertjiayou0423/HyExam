const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// @route   GET api/health
// @desc    Check the health of the server and its dependencies
// @access  Public
router.get('/', (req, res) => {
  const health_checks = {
    uptime: process.uptime(),
    responded_at: new Date().toISOString(),
    database: {
      status: 'checking',
      connection_state: 'unknown',
    },
    environment: {
      mongo_uri_loaded: !!process.env.MONGO_URI,
      jwt_secret_loaded: !!process.env.JWT_SECRET,
    },
  };

  const db_state = mongoose.connection.readyState;
  // Mongoose readyState codes: 0 = disconnected; 1 = connected; 2 = connecting; 3 = disconnecting
  switch (db_state) {
    case 0:
      health_checks.database.status = 'disconnected';
      health_checks.database.connection_state = '🔴 Disconnected';
      break;
    case 1:
      health_checks.database.status = 'connected';
      health_checks.database.connection_state = '🟢 Connected';
      break;
    case 2:
      health_checks.database.status = 'connecting';
      health_checks.database.connection_state = '🟡 Connecting';
      break;
    case 3:
      health_checks.database.status = 'disconnecting';
      health_checks.database.connection_state = '🟠 Disconnecting';
      break;
    default:
       health_checks.database.status = 'unknown';
       health_checks.database.connection_state = '❓ Unknown State';
  }

  res.status(200).json(health_checks);
});

module.exports = router;
