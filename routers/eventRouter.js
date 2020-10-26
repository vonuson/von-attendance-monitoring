const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/search', eventController.searchValidator, eventController.searchEvent);
router.get('/export/:id', eventController.eventObjectIdValidator, eventController.exportEvent);
router.get('/', eventController.getAllEvent);
router.get('/:id', eventController.eventObjectIdValidator, eventController.getEventById);
router.post('/', eventController.eventPropertyValidator, eventController.insertEvent);
router.put('/:id', eventController.eventObjectIdValidator, eventController.eventPropertyValidator,
  eventController.eventUpdatableValidator, eventController.eventExistsValidator,
  eventController.updateEvent);
router.delete('/:id', eventController.eventObjectIdValidator, eventController.eventExistsValidator,
  eventController.deleteEvent);

module.exports = router;
