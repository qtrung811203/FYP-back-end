const express = require('express');
const checkoutController = require('../controllers/checkoutController');

const router = express.Router();

router
  .route('/create-checkout-session')
  .post(checkoutController.createCheckoutSession);

router.route('/session/:sessionId').get(checkoutController.getCheckoutSession);

module.exports = router;
