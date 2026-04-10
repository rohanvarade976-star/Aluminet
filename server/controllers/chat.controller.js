const Message = require('../models/Message');
const User = require('../models/User');

exports.getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ room, isDeleted: false })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    res.json({ messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRooms = async (req, res) => {
  try {
    // Get unique rooms the user has participated in
    const rooms = await Message.aggregate([
      { $match: { sender: req.user._id } },
      { $group: { _id: '$room', lastMessage: { $last: '$content' }, lastAt: { $last: '$createdAt' } } },
      { $sort: { lastAt: -1 } }
    ]);
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (!msg.sender.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    msg.isDeleted = true;
    msg.content = 'This message was deleted';
    await msg.save();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
