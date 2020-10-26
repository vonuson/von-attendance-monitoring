const express = require('express');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router();

router.post('/', attendanceController.attendancePropertyValidator, attendanceController.insertAttendance);
router.put('/:id', attendanceController.attendanceObjectIdValidator, attendanceController.attendancePropertyValidator,
  attendanceController.attendanceUpdatableValidator, attendanceController.attendanceExistsValidator,
  attendanceController.updateAttendance);
router.delete('/:id', attendanceController.attendanceObjectIdValidator, attendanceController.attendanceExistsValidator,
  attendanceController.deleteAttendance);

module.exports = router;
