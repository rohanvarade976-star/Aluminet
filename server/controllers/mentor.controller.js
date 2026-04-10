const User = require('../models/User');
const MentorSession = require('../models/MentorSession');
const { matchMentors } = require('../services/matchingEngine');
const { sendEmail } = require('../services/emailService');

// Get AI-matched mentors for a student
exports.getMatches = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const mentors = await User.find({ role: 'alumni', isActive: true, isFlagged: false })
      .select('name avatar department currentCompany currentRole skills interests bio graduationYear location');

    const matches = matchMentors(student, mentors);
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all available mentors
exports.getAllMentors = async (req, res) => {
  try {
    const { skills, department, page = 1, limit = 12 } = req.query;
    const filter = { role: 'alumni', isActive: true, isFlagged: false };
    if (skills) filter.skills = { $in: skills.split(',') };
    if (department) filter.department = department;

    const mentors = await User.find(filter)
      .select('name avatar department currentCompany currentRole skills bio location graduationYear')
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);

    res.json({ mentors, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Book a session
exports.bookSession = async (req, res) => {
  try {
    const { mentorId, title, description, scheduledAt, duration } = req.body;
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'alumni') return res.status(404).json({ error: 'Mentor not found' });

    const session = await MentorSession.create({
      mentor: mentorId, mentee: req.user._id,
      title, description, scheduledAt, duration: duration || 60
    });

    await sendEmail({
      to: mentor.email,
      subject: `New mentorship session request from ${req.user.name}`,
      html: `<h3>Session Request</h3><p><strong>${req.user.name}</strong> wants to book a session: <em>${title}</em></p><p>Scheduled: ${new Date(scheduledAt).toLocaleString()}</p>`
    });

    const populated = await session.populate(['mentor', 'mentee'], 'name email avatar');
    res.status(201).json({ session: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my sessions (mentor or mentee)
exports.getMySessions = async (req, res) => {
  try {
    const query = req.user.role === 'alumni'
      ? { mentor: req.user._id }
      : { mentee: req.user._id };
    const sessions = await MentorSession.find(query)
      .populate('mentor', 'name avatar currentRole currentCompany')
      .populate('mentee', 'name avatar department')
      .sort({ scheduledAt: -1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update session status
exports.updateSession = async (req, res) => {
  try {
    const { status, meetLink, notes, rating, feedback } = req.body;
    const session = await MentorSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const isInvolved = session.mentor.equals(req.user._id) || session.mentee.equals(req.user._id);
    if (!isInvolved) return res.status(403).json({ error: 'Not authorized' });

    if (status) session.status = status;
    if (meetLink) session.meetLink = meetLink;
    if (notes) session.notes = notes;
    if (rating) session.rating = rating;
    if (feedback) session.feedback = feedback;
    await session.save();

    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
