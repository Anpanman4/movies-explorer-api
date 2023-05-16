const Movie = require('../models/movie');

const SyntexError = require('../errors/syntex-err');
const NotFoundError = require('../errors/not-found-err');
const OwnerError = require('../errors/owner-err');
// const AuthError = require('../errors/auth-err');

const getMovies = (req, res, next) => {
  Movie.find({})
    .populate(['owner'])
    .then((movies) => res.send({ data: movies }))
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    // eslint-disable-next-line max-len
    country, director, duration, year, description, image, trailerLink, thumbnail, movieId, nameRU, nameEN,
  } = req.body;

  Movie.create({
    // eslint-disable-next-line max-len
    country, director, duration, year, description, image, trailerLink, thumbnail, owner: req.user._id, movieId, nameRU, nameEN,
  })
    .then((movie) => movie.populate(['owner']))
    .then((newMovie) => res.status(201).send((newMovie)))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new SyntexError('Переданы некорректные данные при создании пользователя.'));
      }
      return next(err);
    });
};

const deledeMovie = (req, res, next) => {
  const { id } = req.params;

  Movie.findById(id)
    .then((movieData) => {
      if (!movieData) {
        return next(new NotFoundError('Фильм по ID не найдена'));
      }
      if (movieData.owner.toString() !== req.user._id) {
        return next(new OwnerError('Вы не являетесь владельцем фильма'));
      }
      return Movie.findByIdAndDelete(id)
        .then((movie) => res.send(movie))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new SyntexError('Передан невалидный ID'));
      next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deledeMovie,
};
