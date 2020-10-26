const { VALIDATION_REQUIRED, VALIDATION_UPDATABLE, VALIDATION_DOES_NOT_EXISTS, VALIDATION_OBJECT_ID, VALIDATION_DATE_FORMAT, VALIDATION_MAX_LENGTH, VALIDATION_EVENT_DELETION } = require('../util/constants');
const { validate, isValidDate, isStartDateLessThanEndDate } = require('../util/validatorHelper');
const { body, query } = require('express-validator');
const EventModel = require('../models/eventModel');
const { isValidObjectId } = require('mongoose');
const moment = require('moment');

const ExcelExportService = require('../exportService/ExcelExportService');

moment();

// #region API endpoint

/** Transform Event Data to Required View Model */
const transformEventData = (docs) => docs.map(event => transformEventDatum(event));

/** Transform Event Datum to Required View Model */
const transformEventDatum = (event) => {
  return {
    _id: event._id,
    eventName: event.eventName,
    eventType: event.eventType,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    eventAttendances: event.eventAttendances.map(obj => {
      return {
        memberId: obj.member._id,
        name: obj.member.name,
        timeIn: obj.timeIn,
        timeOut: obj.timeOut
      }
    })
  }
};

/** GET: /events/ - Return All Events */
exports.getAllEvent = async (req, res, next) => {
  const eventDocs = await EventModel.find({})
    .populate({ path: 'eventAttendances', populate: 'member' });

  res.status(200).send(transformEventData(eventDocs));
};

/** GET: /events/:id - Return an event by EventId */
exports.getEventById = async (req, res, next) => {
  try {
    const eventDocs = await EventModel.findById(req.params.id)
      .populate({ path: 'eventAttendances', populate: 'member' });

    if (eventDocs) {
      res.status(200).send(transformEventDatum(eventDocs));
    } else {
      res.status(400).json({ result: 'Validation Error', validationMessages: [`Event ${VALIDATION_DOES_NOT_EXISTS}`] });
    }
  } catch (e) {
    next(e);
  }
}

/** POST: /events/ - Insert an event */
exports.insertEvent = async (req, res, next) => {
  try {
    const eventDocs = new EventModel(req.body);
    await eventDocs.save();

    res.sendStatus(201);
  } catch (e) {
    next(e);
  }
}

/** PUT: /events/:id - Update an event */
exports.updateEvent = async (req, res, next) => {
  try {
    await EventModel.findByIdAndUpdate(req.params.id, req.body);

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
}

/** DELETE: /events/:id - Delete an event */
exports.deleteEvent = async (req, res, next) => {
  try {
    const eventDocs = await EventModel.findById(req.params.id)
      .populate('eventAttendances', ['name']);

    if (eventDocs.eventAttendances.length > 0) {
      res.status(400).json({ result: 'Validation Error', validationMessages: [VALIDATION_EVENT_DELETION] });
    } else {
      await EventModel.deleteOne({ _id: req.params.id });
      res.sendStatus(200);
    }
  } catch (e) {
    next(e);
  }
}

/** GET: /events/search - Search events by Event Name, DateTime Start or DateTime End */
exports.searchEvent = async (req, res, next) => {
  const { eventname, datestart, dateend } = req.query;
  const roundOffDateStart = moment(new Date(datestart)).seconds(0).milliseconds(0).toISOString();
  const roundOffDateEnd = moment(new Date(dateend)).seconds(0).milliseconds(0).toISOString();

  const eventDocs = await EventModel
    .find({
      eventName: { $regex: new RegExp(eventname, 'i') },
      startDateTime: { $gte: roundOffDateStart },
      endDateTime: { $lte: roundOffDateEnd },
    })
    .populate({ path: 'eventAttendances', populate: 'member' });

  res.status(200).send(transformEventData(eventDocs));
}

/** GET: /events/export	Return an excel file with the following details based on EventId*/
exports.exportEvent = async (req, res, next) => {
  try {
    const eventDocs = await EventModel.findById(req.params.id)
      .populate({ path: 'eventAttendances', populate: 'member' });

    if (eventDocs) {
      const excelExportService = new ExcelExportService('xlsx');
      const filename = `${eventDocs.eventName} ${excelExportService.formatDateForFilename(eventDocs.startDateTime)}.xlsx`;

      const sortedEventAttendances = transformEventDatum(eventDocs).eventAttendances
        .map(event => {
          return {
            name: event.name,
            timeIn: event.timeIn,
            timeOut: event.timeOut || ''
          }
        })
        .sort((a, b) => (a.timeIn > b.timeIn) ? 1 : -1)
      // Passing the response object to export, the excel4node writes a response if provided
      await excelExportService.export(sortedEventAttendances, filename, res);
    } else {
      res.status(400).json({ result: 'Validation Error', validationMessages: [`Event ${VALIDATION_DOES_NOT_EXISTS}`] });
    }
  } catch (e) {
    next(e);
  }
}

// #endregion API endpoint

// #region validators

/** Validate Event Id */
exports.eventObjectIdValidator = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ result: 'Validation Error', validationMessages: [`Event id ${VALIDATION_OBJECT_ID}`] });
  } else {
    next();
  }
}

/** Validate Event Properties */
exports.eventPropertyValidator = validate([
  body('eventName')
    .not().isEmpty().withMessage(`eventName ${VALIDATION_REQUIRED}`)
    .isLength({ max: 50 }).withMessage(`eventName ${VALIDATION_MAX_LENGTH}`)
    .trim().escape(),
  body('eventType')
    .not().isEmpty().withMessage(`eventType ${VALIDATION_REQUIRED}`)
    .isLength({ max: 50 }).withMessage(`eventType ${VALIDATION_MAX_LENGTH}`)
    .trim().escape(),
  body('startDateTime')
    .not().isEmpty().withMessage(`startDateTime ${VALIDATION_REQUIRED}`)
    .custom(isValidDate).withMessage(`startDateTime ${VALIDATION_DATE_FORMAT}`)
    .custom(isStartDateLessThanEndDate).withMessage('startDateTime should be less than endDateTime.'),
  body('endDateTime')
    .not().isEmpty().withMessage(`endDateTime ${VALIDATION_REQUIRED}`)
    .custom(isValidDate).withMessage(`endDateTime ${VALIDATION_DATE_FORMAT}`)
]);

/** Validate Event if Exists */
exports.eventExistsValidator = async (req, res, next) => {
  try {
    const event = await EventModel.findById(req.params.id).exec();

    if (!event) {
      res.status(400).json({ result: 'Validation Error', validationMessages: [`Event ${VALIDATION_DOES_NOT_EXISTS}`] });
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
}

/** Validate if there are property that can't be updated. */
exports.eventUpdatableValidator = async (req, res, next) => {
  try {
    if (req.body.id !== req.param.id) {
      res.status(400).json({ result: 'Validation Error', validationMessages: [`Event Id ${VALIDATION_UPDATABLE}`] });
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
}

/** Validate the query parameter for search. */
exports.searchValidator = validate([
  query('eventname')
    .not().isEmpty().withMessage(`eventname parameter ${VALIDATION_REQUIRED}`)
    .trim().escape(),
  query('datestart')
    .not().isEmpty().withMessage(`datestart parameter ${VALIDATION_REQUIRED}`)
    .custom(isValidDate).withMessage(`datestart parameter ${VALIDATION_DATE_FORMAT}`)
    .custom(isStartDateLessThanEndDate).withMessage('datestart should be less than endDateTime.'),
  query('dateend')
    .not().isEmpty().withMessage(`dataend parameter ${VALIDATION_REQUIRED}`)
    .custom(isValidDate).withMessage(`dataend parameter ${VALIDATION_DATE_FORMAT}`)
]);

// #endregion validators
