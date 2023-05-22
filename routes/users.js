const router = require('express').Router();

const {
  validatorGetById,
  validatorUpdateUser,
} = require('../middlewares/validator');

const {
  getUsers, getUserById, getUserInfo, updateUserInfo,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUserInfo);
router.patch('/me', validatorUpdateUser, updateUserInfo);
router.get('/:id', validatorGetById, getUserById);

module.exports = router;
