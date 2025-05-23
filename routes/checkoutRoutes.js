const express = require('express');
const checkoutController = require('../controllers/checkoutController');

const router = express.Router();

// api/v1/checkout

//Create a checkout session
router
  .route('/create-checkout-session')
  .post(checkoutController.createCheckoutSession);

//Check session status
// router
//   .route('/check-session-status/:sessionId')
//   .get(checkoutController.checkSession);

//Get checkout session
// router.route('/session/:sessionId').get(checkoutController.getCheckoutSession);

//Handle Stripe and Cod payment
router.route('/success').get(checkoutController.handleCheckoutSuccess);
router.route('/cod-create').post(checkoutController.handleCodCheckout);
router.route('/cod-confirm/:token').post(checkoutController.handleCodConfirm);

module.exports = router;
