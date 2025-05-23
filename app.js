const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const cartRouter = require('./routes/cartRoutes');
const itemRouter = require('./routes/itemRoutes');
const checkoutRouter = require('./routes/checkoutRoutes');
const orderRouter = require('./routes/orderRoutes');
const brandRouter = require('./routes/brandRoutes');

const app = express();

//Error handling
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const nodeCron = require('./utils/nodeCron');

//CRON JOB (Every 24 hours)
nodeCron.start();

//Cookie parser
app.use(cookieParser());

//MIDDLEWARES
//Body parser (reading data from body into req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Enable CORS
const corsOptions = {
  origin: process.env.FRONT_END_URL,
  methods: 'GET, POST, PUT, DELETE, PATCH',
  credentials: true,
};

app.use(cors(corsOptions));

//Set security HTTP headers
app.use(helmet());

//Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(hpp());

//Data sanitization against NoSQL query injection
app.use(mongoSanatize());

//Development log
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Rate limiter
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!',
// });
// app.use('/api', limiter);

//Routes
app.use('/api/v1/products', productRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/checkout', checkoutRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/brands', brandRouter);

//Route Error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
