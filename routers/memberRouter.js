const express = require('express');
const memberController = require('../controllers/memberController');

const router = express.Router();

router.get('/search', memberController.searchValidator, memberController.searchMember);
router.get('/', memberController.getMembers);
router.get('/:id', memberController.memberObjectIdValidator, memberController.getMemberById);
router.post('/', memberController.memberPropertyValidator, memberController.insertMember);
router.put('/:id', memberController.memberObjectIdValidator, memberController.memberPropertyValidator,
  memberController.memberUpdatableValidator, memberController.memberExistsValidator,
  memberController.updateMember);
router.delete('/:id', memberController.memberObjectIdValidator, memberController.memberExistsValidator,
  memberController.deleteMember);

module.exports = router;