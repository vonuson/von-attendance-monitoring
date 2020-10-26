const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  joinedDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    required: true
  },
  memberAttendances: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  }]
});

const MemberModel = mongoose.model('Member', MemberSchema);

module.exports = MemberModel;
