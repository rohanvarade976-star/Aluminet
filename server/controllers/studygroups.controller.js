const StudyGroup = require('../models/StudyGroup');
const { createNotification } = require('./notification.controller');

exports.createGroup = async (req, res) => {
  try {
    const group = await StudyGroup.create({ ...req.body, creator: req.user._id, members: [req.user._id] });
    await group.populate('creator', 'name avatar');
    res.status(201).json({ group });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getGroups = async (req, res) => {
  try {
    const { search, department, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true, isPublic: true };
    if (department) filter.department = department;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
    const groups = await StudyGroup.find(filter)
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await StudyGroup.countDocuments(filter);
    res.json({ groups, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find({ members: req.user._id })
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar')
      .sort({ updatedAt: -1 });
    res.json({ groups });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const isMember = group.members.includes(req.user._id);
    if (isMember) {
      group.members.pull(req.user._id);
      await group.save();
      return res.json({ joined: false, message: 'Left group' });
    }
    if (group.members.length >= group.maxMembers) return res.status(400).json({ error: 'Group is full' });
    group.members.push(req.user._id);
    await group.save();
    await createNotification({
      recipient: group.creator, sender: req.user._id, type: 'study_group_invite',
      title: `${req.user.name} joined your study group`,
      message: `"${group.name}" now has ${group.members.length} members`,
      link: `/study-groups`, io: req.io
    });
    res.json({ joined: true, message: 'Joined group' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Not found' });
    if (!group.members.includes(req.user._id)) return res.status(403).json({ error: 'Not a member' });
    group.messages.push({ sender: req.user._id, content: req.body.content });
    if (group.messages.length > 100) group.messages = group.messages.slice(-100);
    await group.save();
    const lastMsg = group.messages[group.messages.length - 1];
    if (req.io) req.io.to(`group:${group._id}`).emit('group_message', { ...lastMsg.toObject(), senderName: req.user.name });
    res.json({ message: lastMsg });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('creator', 'name avatar role')
      .populate('members', 'name avatar role department')
      .populate('messages.sender', 'name avatar');
    if (!group) return res.status(404).json({ error: 'Not found' });
    res.json({ group });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
