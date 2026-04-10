const router = require('express').Router();
const { createEvent, getEvents, getEvent, rsvpEvent, updateEvent, deleteEvent } = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getEvents);
router.get('/:id', protect, getEvent);
router.post('/', protect, authorize('alumni', 'admin'), createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/rsvp', protect, rsvpEvent);

module.exports = router;
