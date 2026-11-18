const mongoose = require('mongoose');

// Small key/value store for server-wide bookkeeping that must survive restarts
// (for example when the fraud score decay last ran).
const systemStateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  lastRunAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('SystemState', systemStateSchema);
