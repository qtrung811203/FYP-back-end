const express = require('express');
const router = express.Router({ mergeParams: true });
const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');

//api/v1/products/:slug/items (nested route)
// api/v1/items

router
  .route('/')
  .get(itemController.getAllItems)
  .post(
    authController.protect,
    authController.inRole('manager', 'admin'),
    itemController.uploadImage,
    itemController.createItem,
  );

router
  .route('/:id')
  .get(itemController.getItem)
  .patch(
    authController.protect,
    authController.inRole('manager', 'admin'),
    itemController.updateImage,
    itemController.updateItem,
  )
  .delete(
    authController.protect,
    authController.inRole('manager', 'admin'),
    itemController.deleteItem,
  );

module.exports = router;
