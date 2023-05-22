require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

const { errors } = require('celebrate');

const routes = require('./routes');
const globalError = require('./middlewares/globalError');
const limiter = require('./middlewares/limiter');
const { corsMiddleWare } = require('./middlewares/cors');

const { PORT } = require('./utils/utils');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

app.use(helmet());

app.use(corsMiddleWare);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use(limiter);

app.use('/api', routes);

app.use(errorLogger);
app.use(errors());
app.use(globalError);

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.NODE_ENV === 'production' ? process.env.DATABASE_NAME : 'bitfilmsdb'}`, {
  useNewUrlParser: true,
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
