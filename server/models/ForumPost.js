const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

const forumPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['career', 'technical', 'campus', 'general', 'mentorship'], default: 'general' },
  tags: [{ type: String }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  replies: [replySchema],
  isPinned: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);
