const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

//api/v1/products/:productId/reviews
router.use('/:slug/reviews', reviewRouter);

//api/v1/products
router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.uploadImage('imageCover'),
    productController.createProduct,
  );

//api/v1/products/:slug/item
router
  .route('/:slug/items')
  .post(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.uploadImage('imageItem'),
    productController.addItemToProduct,
  );

//api/v1/products/:slug/items/:itemId
router
  .route('/:slug/items/:itemId')
  .get(productController.getItem)
  .patch(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.updateImage('imageItem'),
    productController.updateItem,
  )
  .delete(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.deleteItem,
  );

//api/v1/products/:slug
router
  .route('/:slug')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.updateImage('imageCover'),
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.deleteProduct,
  );

module.exports = router;
