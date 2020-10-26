const { VALIDATION_REQUIRED, VALIDATION_UPDATABLE, VALIDATION_DOES_NOT_EXISTS, VALIDATION_OBJECT_ID, VALIDATION_DATE_FORMAT, VALIDATION_MAX_LENGTH, VALIDATION_STATUS, VALIDATION_MEMBER_DELETION } = require('../util/constants');
const { validate, isEmptyOrValidDate, isValidStatus } = require('../util/validatorHelper');
const MemberModel = require('../models/memberModel');
const { body, query } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const moment = require('moment');

moment();

// #region API endpoint

/** Transform Member Data to Required View Model */
const transformMemberData = (docs) => docs.map(member => transformMemberDatum(member));

/** Transform Member Datum to Required View Model */
const transformMemberDatum = (member) => {
  return {
    _id: member._id,
    name: member.name,
    joinedDate: member.joinedDate,
    status: member.status,
    eventAttendance: member.memberAttendances.map(obj => {
      return {
        eventName: obj.event.eventName,
        timeIn: obj.timeIn,
        timeOut: obj.timeOut
      }
    })
  }
};

/** GET: /members/ - Return All Members */
exports.getMembers = async (req, res, next) => {
  const memberDocs = await MemberModel.find({})
    .populate({ path: 'memberAttendances', populate: 'event' });

  res.status(200).send(transformMemberData(memberDocs));
};

/** GET: /members/:id - Return an member by MemberId */
exports.getMemberById = async (req, res, next) => {
  try {
    const memberDocs = await MemberModel.findById(req.params.id)
      .populate({ path: 'memberAttendances', populate: 'event' });

    if (memberDocs) {
      res.status(200).send(transformMemberDatum(memberDocs));
    } else {
      res.status(400).json({ result: 'Validation Error', validationMessages: [`Member ${VALIDATION_DOES_NOT_EXISTS}`] });
    }
  } catch (e) {
    next(e);
  }
}

/** POST: /members/ - Insert a member */
exports.insertMember = async (req, res, next) => {
  try {
    const memberDocs = new MemberModel(req.body);
    await memberDocs.save();

    res.sendStatus(201);
  } catch (e) {
    next(e);
  }
}

/** PUT: /members/:id - Update a member */
exports.updateMember = async (req, res, next) => {
  try {
    await MemberModel.findByIdAndUpdate(req.params.id, req.body);

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
}

/** DELETE: /members/:id - Delete a member */
exports.deleteMember = async (req, res, next) => {
  try {
    const memberDocs = await MemberModel.findById(req.params.id)
      .populate('memberAttendances', ['name']);

    if (memberDocs.memberAttendances.length > 0) {
      res.status(400).json({ result: 'Validation Error', validationMessages: [VALIDATION_MEMBER_DELETION] });
    } else {
      await MemberModel.deleteOne({ _id: req.params.id });
      res.sendStatus(200);
    }
  } catch (e) {
    next(e);
  }
}

/** GET: /members/search - Search members by Name and Status */
exports.searchMember = async (req, res, next) => {
  const { name, status } = req.query;
  const memberDocs = await MemberModel
    .find({
      name: { $regex: new RegExp(name, 'i') },
      status: { $regex: new RegExp(status, 'i') },
    })
    .populate({ path: 'memberAttendances', populate: 'event' });

  res.status(200).send(transformMemberData(memberDocs));
}

// #endregion API endpoint

// #region validators

/** Validate Member Id */
exports.memberObjectIdValidator = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ result: 'Validation Error', validationMessages: [`Member id ${VALIDATION_OBJECT_ID}`] });
  } else {
    next();
  }
}

/** Validate Member Properties */
exports.memberPropertyValidator = validate([
  body('name')
    .not().isEmpty().withMessage(`name ${VALIDATION_REQUIRED}`)
    .isLength({ max: 50 }).withMessage(`name ${VALIDATION_MAX_LENGTH}`)
    .trim().escape(),
  body('joinedDate')
    .custom(isEmptyOrValidDate).withMessage(`joinedDate ${VALIDATION_DATE_FORMAT}`),
  body('status')
    .not().isEmpty().withMessage(`status ${VALIDATION_REQUIRED}`)
    .custom(isValidStatus).withMessage(VALIDATION_STATUS)
    .trim().escape()
]);

/** Validate Member if Exists and Return member */
exports.memberExistsValidator = async (req, res, next) => {
  try {
    const member = await MemberModel.findById(req.params.id);

    if (!member) {
      res.status(400).json({ result: 'Validation Error', validationMessages: [`Member ${VALIDATION_DOES_NOT_EXISTS}`] });
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
}

/** Validate if there are property that can't be updated. */
exports.memberUpdatableValidator = async (req, res, next) => {
  try {
    if (req.body.id !== req.param.id) {
      res.status(400).json({ result: 'Validation Error', validationMessages: [`Member Id ${VALIDATION_UPDATABLE}`] });
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
}

/** Validate the query parameter for search. */
exports.searchValidator = validate([
  query('name')
    .not().isEmpty().withMessage(`name parameter ${VALIDATION_REQUIRED}`)
    .trim().escape(),
  query('status')
    .not().isEmpty().withMessage(`status parameter ${VALIDATION_REQUIRED}`)
    .custom(isValidStatus).withMessage(VALIDATION_STATUS)
    .trim().escape(),
]);

// #endregion validators
