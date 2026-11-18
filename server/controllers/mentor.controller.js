const User = require('../models/User');
const MentorSession = require('../models/MentorSession');
const { matchMentors } = require('../services/matchingEngine');
const { sendEmail } = require('../services/emailService');
const { awardAchievement } = require('./achievements.controller');
const { createNotification } = require('./notification.controller');

// Get AI-matched mentors for a student
exports.getMatches = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    // Only verified alumni can be mentors
    const mentors = await User.find({ role: 'alumni', verificationStatus: 'approved', isActive: true, isFlagged: false })
      .select('name avatar department currentCompany currentRole skills interests bio graduationYear location');

    let matches = matchMentors(student, mentors);


    res.json({ matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all available mentors
exports.getAllMentors = async (req, res) => {
  try {
    const { skills, department, page = 1, limit = 12 } = req.query;
    // Only verified alumni can be mentors
    const filter = { role: 'alumni', verificationStatus: 'approved', isActive: true, isFlagged: false };
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
    // Only verified alumni can be booked as mentors
    if (!mentor || mentor.role !== 'alumni' || mentor.verificationStatus !== 'approved') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const session = await MentorSession.create({
      mentor: mentorId, mentee: req.user._id,
      title, description, scheduledAt, duration: duration || 60
    });

    await sendEmail({
      to: mentor.email,
      subject: `New mentorship session request from ${req.user.name}`,
      html: `<h3>Session Request</h3><p><strong>${req.user.name}</strong> wants to book a session: <em>${title}</em></p><p>Scheduled: ${new Date(scheduledAt).toLocaleString()}</p>`
    });

    // In-app notification to mentor
    await createNotification({
      recipient: mentorId,
      sender: req.user._id,
      type: 'session_request',
      title: `New session request from ${req.user.name}`,
      message: `Topic: ${title}`,
      link: '/sessions',
      io: req.io
    }).catch(() => {});

    // Award first_session achievement to student
    awardAchievement(req.user._id, 'first_session', req.io).catch(() => {});

    const populated = await session.populate(['mentor', 'mentee'], 'name avatar');
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

const SESSION_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// Update a session. Who may change what:
//   mentor: status pending->confirmed, confirmed->completed; meetLink, notes
//   mentor or mentee: cancel a pending request, or a confirmed session that hasn't started yet
//   mentee: rating (1-5, once, only after completed), feedback
// Anything else is rejected with 403; a rating before completion is a 400.
exports.updateSession = async (req, res) => {
  try {
    const { status, meetLink, notes, rating, feedback } = req.body;
    const session = await MentorSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const isMentor = session.mentor.equals(req.user._id);
    const isMentee = session.mentee.equals(req.user._id);
    if (!isMentor && !isMentee) return res.status(403).json({ error: 'Not authorized' });
    const forbid = (error) => res.status(403).json({ error });

    // Fields owned by one side
    if (!isMentor && (meetLink !== undefined || notes !== undefined)) {
      return forbid('Only the mentor can add a meeting link or notes');
    }
    if (!isMentee && (rating !== undefined || feedback !== undefined)) {
      return forbid('Only the mentee can rate a session or leave feedback');
    }

    // Status changes
    if (status !== undefined) {
      if (!SESSION_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
      const from = session.status;
      // Either side may cancel: a pending request, or a confirmed session that hasn't started yet
      const cancel = status === 'cancelled' && (from === 'pending' || from === 'confirmed');
      const allowed = cancel || (isMentor
        && ((status === 'confirmed' && from === 'pending') || (status === 'completed' && from === 'confirmed')));
      if (!allowed) return forbid(`You cannot change this session from ${from} to ${status}`);
      if (cancel && from === 'confirmed' && new Date(session.scheduledAt) <= new Date()) {
        return res.status(400).json({ error: 'Cannot cancel a session that has already started' });
      }
      if (status === 'completed' && new Date(session.scheduledAt) > new Date()) {
        return res.status(400).json({ error: 'Cannot mark as complete before the scheduled time' });
      }
    }

    // Rating and feedback (mentee only, after the session is completed)
    if (rating !== undefined || feedback !== undefined) {
      if (session.status !== 'completed') {
        return res.status(400).json({ error: 'You can only rate a session after it is completed' });
      }
      if (rating !== undefined) {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5' });
        }
        if (session.rating) return res.status(400).json({ error: 'This session has already been rated' });
      }
      if (feedback !== undefined && (typeof feedback !== 'string' || feedback.length > 1000)) {
        return res.status(400).json({ error: 'Feedback must be text of at most 1000 characters' });
      }
    }

    if (status !== undefined) session.status = status;
    if (meetLink) session.meetLink = meetLink;
    if (notes) session.notes = notes;
    if (rating !== undefined) session.rating = rating;
    if (feedback) session.feedback = feedback;
    await session.save();

    if (status === 'completed') {
      const completedCount = await MentorSession.countDocuments({
        mentee: session.mentee,
        status: 'completed'
      });
      if (completedCount >= 5) {
        awardAchievement(session.mentee, 'five_sessions', req.io).catch(() => {});
      }
      // Notify mentee that session was marked complete
      await createNotification({
        recipient: session.mentee,
        sender: req.user._id,
        type: 'session_confirmed',
        title: 'Session marked as completed',
        message: `Your session "${session.title}" has been completed`,
        link: '/sessions',
        io: req.io
      }).catch(() => {});
    }

    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
