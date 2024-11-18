const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/create-cod-order').post(orderController.createCodOrder);

router.use(authController.protect);
//Fix to get order by user
router.route('/today-orders').get(orderController.getOrdersToday);
router.route('/my-orders').get(orderController.getMyOrders);
router.route('/').get(orderController.getOrders);

module.exports = router;
