const express = require('express');
const morgan = require('morgan');
const app = express();
const dotenv = require('dotenv');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');

//Error handling
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

dotenv.config({ path: './config.env' });

//All the middleware put here
app.use(express.json());

//HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//testing req, res
app.use((req, res, next) => {
  next();
});

//Routes
app.use('/api/v1/products', productRouter.router);
app.use('/api/v1/users', userRouter.router);

//Route Error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
