const { validationResult } = require('express-validator');
const moment = require('moment');

moment();

const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ result: 'Validation Error', validationMessages: errors.array().map(err => err.msg) });
  };
};

const isValidDate = (value) => {
  return moment(new Date(value)).isValid();
};

const isEmptyOrValidDate = (value) => {
  if (value) {
    return isValidDate(value);
  }
  return true;
};

const isStartDateLessThanEndDate = (value, { req, loc, path }) => {
  const endDateTime = req.body.endDateTime || req.query.dateend;
  return value < endDateTime;
};

const isTimeInLessThanTimeOut = (value, { req, loc, path }) => {
  const endDateTime = req.query.timeOut;
  if (endDateTime) {
    return value < endDateTime;
  }
  return true;
};

const validStatus = ['active', 'in-active'];
const isValidStatus = (value) => {
  const processed = (value || '').trim().toLowerCase();
  return validStatus.indexOf(processed) >= 0;
};

module.exports = {
  validate,
  isValidDate,
  isEmptyOrValidDate,
  isStartDateLessThanEndDate,
  isTimeInLessThanTimeOut,
  isValidStatus
}