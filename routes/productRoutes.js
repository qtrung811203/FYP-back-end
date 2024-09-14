const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const itemRouter = require('./itemRoutes');

//api/v1/products/:productId/reviews
router.use('/:slug/reviews', reviewRouter);
router.use('/:slug/items', itemRouter);

//api/v1/products/home-products
router.get('/home', productController.getHomeProducts);

//api/v1/products
router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.uploadImage,
    productController.createProduct,
  );

//api/v1/products/:slug
router
  .route('/:slug')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.updateImage,
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.deleteProduct,
  );

module.exports = router;
