const express = require('express');
const checkoutController = require('../controllers/checkoutController');

const router = express.Router();

//Create a checkout session
router
  .route('/create-checkout-session')
  .post(checkoutController.createCheckoutSession);

//Check session status
router
  .route('/check-session-status/:sessionId')
  .get(checkoutController.checkSession);

//Get checkout session
router.route('/session/:sessionId').get(checkoutController.getCheckoutSession);

module.exports = router;
