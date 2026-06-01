const Event = require('../models/Event');
const { awardAchievement } = require('./achievements.controller');
const { sendEmail } = require('../services/emailService');
const User = require('../models/User');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, type, scheduledAt, maxAttendees, meetLink, bannerUrl, tags, isPublished } = req.body;
    const event = await Event.create({
      title, description, type, scheduledAt, maxAttendees, meetLink, bannerUrl, tags, isPublished,
      host: req.user._id
    });
    awardAchievement(req.user._id, 'event_host', req.io).catch(() => {});
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const filter = { isPublished: true };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('host', 'name avatar currentRole currentCompany')
      .populate('speakers', 'name avatar currentRole')
      .sort({ scheduledAt: 1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await Event.countDocuments(filter);

    res.json({ events, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('host', 'name avatar bio currentRole')
      .populate('speakers', 'name avatar bio currentRole currentCompany')
      .populate('attendees', 'name avatar');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const baseEvent = await Event.findById(req.params.id);
    if (!baseEvent) return res.status(404).json({ error: 'Event not found' });

    const alreadyRSVPd = baseEvent.attendees.includes(req.user._id);
    if (alreadyRSVPd) {
      await Event.findByIdAndUpdate(req.params.id, { $pull: { attendees: req.user._id } });
      return res.json({ message: 'RSVP cancelled', attending: false });
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, $expr: { $lt: [{ $size: '$attendees' }, '$maxAttendees'] } },
      { $addToSet: { attendees: req.user._id } },
      { new: true }
    );

    if (!event) return res.status(400).json({ error: 'Event is full or not found' });

    await sendEmail({
      to: req.user.email,
      subject: `You're registered for: ${event.title}`,
      html: `<h3>RSVP Confirmed!</h3><p>You are registered for <strong>${event.title}</strong></p><p>Date: ${new Date(event.scheduledAt).toLocaleString()}</p>${event.meetLink ? `<p><a href="${event.meetLink}">Join Link</a></p>` : ''}`
    });

    res.json({ message: 'RSVP confirmed!', attending: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.host.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });

    Object.assign(event, req.body);
    await event.save();
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.host.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
