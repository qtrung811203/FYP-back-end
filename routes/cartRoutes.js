const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');

// for user
router.use(authController.protect);
router
  .route('/')
  .get(cartController.getMyCart)
  .post(cartController.addItemToCart)
  .patch(cartController.updateCart)
  .delete(cartController.deleteAllItemsFromCart);

router.route('/:itemId').delete(cartController.deleteOneItemFromCart);

//for admin & manager
router.use(authController.inRole('manager', 'admin'));
router.route('/all').get(cartController.getAllCarts);
router
  .route('/all/:id')
  .get(cartController.getOneCart)
  .delete(cartController.deleteCart);

module.exports = router;
