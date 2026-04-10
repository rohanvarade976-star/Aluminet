const Event = require('../models/Event');
const { sendEmail } = require('../services/emailService');
const User = require('../models/User');

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, host: req.user._id });
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
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.attendees.length >= event.maxAttendees) return res.status(400).json({ error: 'Event is full' });

    const alreadyRSVPd = event.attendees.includes(req.user._id);
    if (alreadyRSVPd) {
      event.attendees.pull(req.user._id);
      await event.save();
      return res.json({ message: 'RSVP cancelled', attending: false });
    }

    event.attendees.push(req.user._id);
    await event.save();

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
