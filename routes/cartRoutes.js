const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');

router.use(authController.protect);
router
  .route('/')
  .get(cartController.getMyCart)
  .post(cartController.addToCart)
  .patch(cartController.updateCart)
  .delete(cartController.deleteCart);

router.route('/:productId').delete(cartController.removeFromCart);

// router.route('/update-quantity').patch(cartController.updateQuantity);
// router.route('/delete-product').delete(cartController.deleteProduct);
// router.route('/delete-all-products').delete(cartController.deleteAllProducts);

module.exports = router;
