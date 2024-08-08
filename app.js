const express = require('express');
const morgan = require('morgan');
const app = express();
const dotenv = require('dotenv');
const productRouter = require('./routes/productRoutes');

dotenv.config({ path: './config.env' });

//All the middleware put here
app.use(express.json());

//HTTP request logger
app.use(morgan('dev'));

//Routes
app.use('/api/v1/products', productRouter.router);

module.exports = app;
