const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
  timeIn: {
    type: Date,
    required: true
  },
  timeOut: {
    type: Date,
    required: false
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }
});

const AttendanceModel = mongoose.model('Attendance', AttendanceSchema);

module.exports = AttendanceModel;
