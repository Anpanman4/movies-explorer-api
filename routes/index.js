const router = require('express').Router();

const NotFoundError = require('../errors/not-found-err');

const auth = require('../middlewares/auth');
const {
  validatorSignIn,
  validatorSignUp,
} = require('../middlewares/validator');

const userRoutes = require('./users');
const movieRoutes = require('./movies');

const { login, createUser } = require('../controllers/users');

router.post('/signin', validatorSignIn, login);
router.post('/signup', validatorSignUp, createUser);

router.use(auth);

router.use('/users', userRoutes);
router.use('/movies', movieRoutes);
router.use((req, res, next) => next(new NotFoundError('Данный путь не существует')));

module.exports = router;
