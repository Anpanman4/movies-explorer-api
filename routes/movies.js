const router = require('express').Router();

const {
  validatorCreateMovie,
  validatorDeleteById,
} = require('../middlewares/validator');

const {
  getMovies, createMovie, deledeMovie,
} = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', validatorCreateMovie, createMovie);
router.delete('/:id', validatorDeleteById, deledeMovie);

module.exports = router;
