const VALIDATION_REQUIRED = 'is required.';
const VALIDATION_UPDATABLE = 'should not be updated.';
const VALIDATION_DOES_NOT_EXISTS = 'does not exists.';
const VALIDATION_OBJECT_ID = 'should be an ObjectId.';
const VALIDATION_DATE_FORMAT = 'should have a date format.';
const VALIDATION_MAX_LENGTH = 'should be less than 50 character.';
const VALIDATION_STATUS = 'status should be either Active or In-active.';
const VALIDATION_EVENT_DELETION = `This event can't be deleted because it already has a memeber associated.`;
const VALIDATION_MEMBER_DELETION = `This member can't be deleted because it already has an event associated.`;
const LOG_HEADER =
  `================================
== Attendance Monitoring Logs ==
================================`;

module.exports = {
  VALIDATION_REQUIRED,
  VALIDATION_UPDATABLE,
  VALIDATION_DOES_NOT_EXISTS,
  VALIDATION_OBJECT_ID,
  VALIDATION_DATE_FORMAT,
  VALIDATION_MAX_LENGTH,
  VALIDATION_STATUS,
  VALIDATION_EVENT_DELETION,
  VALIDATION_MEMBER_DELETION,
  LOG_HEADER
}