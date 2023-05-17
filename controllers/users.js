require('dotenv').config();
const { hash, compare } = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const User = require('../models/user');

const SyntexError = require('../errors/syntex-err');
const NotFoundError = require('../errors/not-found-err');
const AuthError = require('../errors/auth-err');
const AlreadyCreatedError = require('../errors/already-created-err');

const { JWT_SECRET } = require('../utils/utils');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { id } = req.params;

  User.findById(id, { name: 1 })
    .then((user) => {
      if (user) return res.send(user);
      return next(new NotFoundError('Пользователь по ID не найден'));
    })
    .catch((err) => {
      if (err.name === 'CastError') return next(new SyntexError('Передан неправильный параметр'));
      return next(err);
    });
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

const updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (user) res.send(user);
    })
    .catch((err) => {
      if (err.name === 'MongoServerError') return next(new SyntexError('Такой Email уже существует.'));
      if (err.name === 'ValidationError') return next(new SyntexError('Переданы некорректные данные для обновления информации.'));
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new AuthError('Пользователь не найден'));
      }
      return compare(password, user.password)
        .then((isMatched) => {
          if (!isMatched) {
            next(new AuthError('Введен неправильный пароль'));
          } else {
            const jwt = jsonwebtoken.sign({ _id: user._id }, process.env.NODE_ENV !== 'production' ? JWT_SECRET : process.env.JWT_SECRET, {
              expiresIn: '7d',
            });

            res.send({ token: jwt });
          }
        })
        .catch(next);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  hash(password, 10)
    .then((hashPassword) => {
      User.create({
        name, email, password: hashPassword,
      })
        .then((user) => {
          if (user) {
            res.status(201).send({
              name, email,
            });
          }
        })
        .catch((err) => {
          if (err.code === 11000) {
            return next(new AlreadyCreatedError('Пользователь с таким Email уже зарегистрирован'));
          }
          if (err.name === 'ValidationError') {
            return next(new SyntexError('Переданы некорректные данные при создании пользователя.'));
          }
          return next(err);
        });
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUserById,
  getUserInfo,
  login,
  createUser,
  updateUserInfo,
};
