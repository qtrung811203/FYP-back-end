const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//Error handling
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

dotenv.config({ path: './config.env' });

//MIDDLEWARES
//Set security HTTP headers
app.use(helmet());

//Data sanitization against NoSQL query injection
app.use(mongoSanatize());

//Data sanitization against XSS
app.use(xss());

//Body parser (reading data from body into req.body)
app.use(express.json());

//Development log
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Routes
app.use('/api/v1/products', productRouter.router);
app.use('/api/v1/users', userRouter.router);

//Route Error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
