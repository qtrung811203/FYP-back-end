const express = require('express');
const checkoutController = require('../controllers/checkoutController');

const router = express.Router();

router.route('/checkout-session').post(checkoutController.getCheckoutSession);

module.exports = router;
