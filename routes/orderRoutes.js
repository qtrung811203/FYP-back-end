const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/create-cod-order').post(orderController.createCodOrder);

router.use(authController.protect);
router.route('/').get(orderController.getOrders);

module.exports = router;
