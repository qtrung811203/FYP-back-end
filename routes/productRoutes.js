const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

//api/v1/products/:productId/reviews
router.use('/:productId/reviews', reviewRouter);

//api/v1/products
router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.uploadProductImageCover,
    productController.createProduct,
  );

//api/v1/products/:id
router
  .route('/:slug')
  .get(productController.getProduct)
  .post(productController.addItemToProduct)
  .patch(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.updateProductImageCover,
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.deleteProduct,
  );

module.exports = router;
