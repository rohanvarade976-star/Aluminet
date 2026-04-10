const mongoose = require('mongoose');

const fraudLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: { type: String },
  action: { type: String, required: true },
  reason: { type: String, required: true },
  score: { type: Number, default: 0 },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('FraudLog', fraudLogSchema);
