const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'file', 'image'], default: 'text' },
  fileUrl: { type: String, default: '' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
