const Activity = require('../models/Activity');

async function logActivity({ ticket, actor, action, message = '', metadata = {} }) {
  return Activity.create({ ticket, actor, action, message, metadata });
}

module.exports = { logActivity };