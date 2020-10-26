const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  eventName: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  eventAttendances: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  }]
});

const EventModel = mongoose.model('Event', EventSchema);

module.exports = EventModel;
