const router = require('express').Router();
const { createEvent, getEvents, getEvent, rsvpEvent, updateEvent, deleteEvent } = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { fraudDetect } = require('../middleware/fraud.middleware');

router.get('/', protect, getEvents);
router.get('/:id', protect, getEvent);
router.post('/', protect, fraudDetect, authorize('alumni', 'admin'), createEvent);
router.put('/:id', protect, fraudDetect, updateEvent);
router.delete('/:id', protect, fraudDetect, deleteEvent);
router.post('/:id/rsvp', protect, fraudDetect, rsvpEvent);

module.exports = router;
