const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/create-cod-order').post(orderController.createCodOrder);

module.exports = router;
