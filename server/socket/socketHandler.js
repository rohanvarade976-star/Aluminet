const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');
const StudyGroup = require('../models/StudyGroup');
const { canAccessRoom } = require('../utils/roomAccess');

const FLAG_RECHECK_MS = 60 * 1000; // how long a socket may trust its cached isFlagged value

const onlineUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar role isFlagged');
      if (!user) return next(new Error('User not found'));
      // socket.user is sent to other users in user_joined / user_typing events, so it must stay
      // public-safe. The flag is kept separately on socket.flag (re-checked from the DB, see below).
      const { isFlagged, ...publicUser } = user.toObject();
      socket.user = publicUser;
      socket.flag = { value: !!isFlagged, checkedAt: Date.now() };
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

    const denyRoom = (room) =>
      socket.emit('error', { message: 'Not authorized to access this room', room });

    // Flagged non-admin users can't write (send / delete / typing). The flag is loaded at connect
    // and re-read from the database at most once a minute per socket, not on every event.
    const isRestricted = async () => {
      if (socket.user.role === 'admin') return false;
      const flag = socket.flag;
      if (Date.now() - flag.checkedAt > FLAG_RECHECK_MS) {
        flag.checkedAt = Date.now(); // set first so concurrent events don't all re-query
        try {
          const fresh = await User.findById(socket.user._id).select('isFlagged');
          flag.value = !!fresh?.isFlagged;
        } catch (err) {
          console.warn('Flag re-check failed, keeping cached value:', err.message);
        }
      }
      return flag.value;
    };
    const denyRestricted = () =>
      socket.emit('error', { message: 'Your account is restricted. Contact an admin.' });

    // Join a chat room
    socket.on('join_room', async (room) => {
      if (!(await canAccessRoom(socket.user, room))) return denyRoom(room);
      socket.join(room);
      socket.to(room).emit('user_joined', { user: socket.user, room });
    });

    // Leave a room
    socket.on('leave_room', (room) => {
      socket.leave(room);
      socket.to(room).emit('user_left', { user: socket.user, room });
    });

    // Join a study group room explicitly
    socket.on('join_group', async (groupId) => {
      const room = `group:${groupId}`;
      if (!(await canAccessRoom(socket.user, room))) return denyRoom(room);
      socket.join(room);
    });

    // Send chat message
    socket.on('send_message', async ({ room, content, type = 'text', fileUrl } = {}) => {
      if (await isRestricted()) return denyRestricted();
      if (!(await canAccessRoom(socket.user, room))) return denyRoom(room);
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
    socket.on('delete_message', async ({ room, messageId } = {}) => {
      if (await isRestricted()) return denyRestricted();
      if (!(await canAccessRoom(socket.user, room))) return denyRoom(room);
      try {
        const msg = await Message.findById(messageId);
        if (!msg || msg.room !== room) return;
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
    socket.on('mark_messages_read', async ({ room } = {}) => {
      if (!(await canAccessRoom(socket.user, room))) return denyRoom(room);
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
    socket.on('typing', async ({ room, isTyping } = {}) => {
      if (await isRestricted()) return; // silent: no error event for typing (it fires on every keystroke)
      if (!(await canAccessRoom(socket.user, room))) return;
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
