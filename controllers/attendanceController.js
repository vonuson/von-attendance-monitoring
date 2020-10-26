const { VALIDATION_REQUIRED, VALIDATION_UPDATABLE, VALIDATION_DOES_NOT_EXISTS, VALIDATION_OBJECT_ID, VALIDATION_DATE_FORMAT } = require('../util/constants');
const { validate, isValidDate, isTimeInLessThanTimeOut, isEmptyOrValidDate } = require('../util/validatorHelper');
const AttendanceModel = require('../models/attendanceModel');
const MemberModel = require('../models/memberModel');
const EventModel = require('../models/eventModel');
const { isValidObjectId } = require('mongoose');
const { body } = require('express-validator');
const moment = require('moment');


moment();

// #region API endpoint

/** POST: /attendance/ - Insert an attendance */
exports.insertAttendance = async (req, res, next) => {
  try {
    const attendanceDocs = new AttendanceModel(req.body);

    const memberDocs = await MemberModel.findById(req.body.member);
    memberDocs.memberAttendances.push(attendanceDocs._id);

    const eventDocs = await EventModel.findById(req.body.event);
    eventDocs.eventAttendances.push(attendanceDocs._id);

    await attendanceDocs.save();
    await memberDocs.save();
    await eventDocs.save();

    res.sendStatus(201);
  } catch (e) {
    next(e);
  }
}

/** PUT: /attendance/:id - Update an attendance */
exports.updateAttendance = async (req, res, next) => {
  try {
    await AttendanceModel.findByIdAndUpdate(req.params.id, req.body);

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
}

/** DELETE: /attendance/:id - Delete an attendance */
exports.deleteAttendance = async (req, res, next) => {
  try {
    await AttendanceModel.deleteOne({ _id: req.params.id });

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
}

// #endregion API endpoint

// #region validators

/** Validate Attendance Id */
exports.attendanceObjectIdValidator = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ result: 'Validation Error', validationMessages: [`Attendance id ${VALIDATION_OBJECT_ID}`] });
  } else {
    next();
  }
}

/** Validate Attendance Properties */
exports.attendancePropertyValidator = validate([
  body('timeIn')
    .not().isEmpty().withMessage(`timeIn ${VALIDATION_REQUIRED}`)
    .custom(isValidDate).withMessage(`timeIn ${VALIDATION_DATE_FORMAT}`)
    .custom(isTimeInLessThanTimeOut).withMessage('timeIn should be less than timeOut.'),
  body('timeOut')
    .custom(isEmptyOrValidDate).withMessage(`timeOut ${VALIDATION_DATE_FORMAT}`)
]);

/** Validate Attendance if Exists and Return attendance */
exports.attendanceExistsValidator = async (req, res, next) => {
  try {
    const attendance = await AttendanceModel.findById(req.params.id).exec();

    if (attendance) {
      next();
    } else {
      res.status(400).json({ result: 'Validation Error', validationMessages: [`Attendance ${VALIDATION_DOES_NOT_EXISTS}`] });
    }
  } catch (e) {
    next(e);
  }
}

/** Validate if there are property that can't be updated. */
exports.attendanceUpdatableValidator = async (req, res, next) => {
  try {
    if (req.body.id !== req.param.id) {
      res.status(400).json({ result: 'Validation Error', validationMessages: [`Attendance Id ${VALIDATION_UPDATABLE}`] });
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
}

// #endregion validators
