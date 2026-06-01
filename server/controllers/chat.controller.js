const Message = require('../models/Message');
const User = require('../models/User');

exports.getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ room })
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
    const userId = req.user._id.toString();
    
    let rooms = await Message.aggregate([
      { 
        $match: { 
          $or: [
            { sender: req.user._id },
            { room: { $regex: userId } }
          ]
        } 
      },
      { $sort: { createdAt: 1 } },
      { $group: { _id: '$room', lastMessage: { $last: '$content' }, lastAt: { $last: '$createdAt' } } },
      { $sort: { lastAt: -1 } }
    ]);

    // Populate other user details for private rooms
    const User = require('../models/User');
    rooms = await Promise.all(rooms.map(async (room) => {
      if (room._id.includes('_')) {
        const parts = room._id.split('_');
        if (parts.length === 2) {
          const otherId = parts[0] === userId ? parts[1] : parts[0];
          try {
            const otherUser = await User.findById(otherId).select('name avatar role');
            if (otherUser) {
              return { ...room, otherUser };
            }
          } catch(e) {}
        }
      }
      return room;
    }));

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
