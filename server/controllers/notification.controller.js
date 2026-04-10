const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Helper to create notifications (used by other controllers)
exports.createNotification = async ({ recipient, sender, type, title, message, link, meta, io }) => {
  try {
    const notif = await Notification.create({ recipient, sender, type, title, message, link: link || '', meta });
    if (io) {
      const populated = await notif.populate('sender', 'name avatar');
      io.to(`user:${recipient}`).emit('new_notification', populated);
    }
    return notif;
  } catch (err) { console.error('Notif create error:', err.message); }
};
