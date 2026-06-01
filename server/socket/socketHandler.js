const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');
const StudyGroup = require('../models/StudyGroup');

const onlineUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar role');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 Socket connected: ${socket.user.name}`);

    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));

    // Auto-join personal notification room (user:{id})
    socket.join(`user:${userId}`);

    // Auto-join all study group rooms the user is a member of
    try {
      const myGroups = await StudyGroup.find({ members: socket.user._id, isActive: true }).select('_id');
      myGroups.forEach(g => socket.join(`group:${g._id}`));
    } catch (err) {
      console.warn('Could not auto-join study groups:', err.message);
    }

    // Join a chat room
    socket.on('join_room', (room) => {
      socket.join(room);
      socket.to(room).emit('user_joined', { user: socket.user, room });
    });

    // Leave a room
    socket.on('leave_room', (room) => {
      socket.leave(room);
      socket.to(room).emit('user_left', { user: socket.user, room });
    });

    // Join a study group room explicitly
    socket.on('join_group', (groupId) => {
      socket.join(`group:${groupId}`);
    });

    // Send chat message
    socket.on('send_message', async ({ room, content, type = 'text', fileUrl }) => {
      try {
        const message = await Message.create({
          room, sender: socket.user._id, content, type, fileUrl
        });
        const populated = await message.populate('sender', 'name avatar role');
        io.to(room).emit('new_message', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Delete a message via socket
    socket.on('delete_message', async ({ room, messageId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (!msg.sender.equals(socket.user._id) && socket.user.role !== 'admin') return;
        msg.isDeleted = true;
        msg.content = '🚫 This message was deleted';
        await msg.save();
        io.to(room).emit('message_deleted', { messageId, content: msg.content });
      } catch (err) {
        console.error('Socket delete error:', err.message);
      }
    });

    // Mark messages as read
    socket.on('mark_messages_read', async ({ room }) => {
      try {
        const result = await Message.updateMany(
          { room, sender: { $ne: socket.user._id }, readBy: { $ne: socket.user._id } },
          { $addToSet: { readBy: socket.user._id } }
        );
        if (result.modifiedCount > 0) {
          socket.to(room).emit('messages_read', { room, readerId: socket.user._id });
        }
      } catch (err) {
        console.error('Socket mark_read error:', err.message);
      }
    });

    // Typing indicator
    socket.on('typing', ({ room, isTyping }) => {
      socket.to(room).emit('user_typing', { user: socket.user, isTyping });
    });

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = { initSocket };
