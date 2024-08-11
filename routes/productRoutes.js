const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

//api/v1/products
router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.createProduct,
  );

//api/v1/products/:id
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.inRole('manager', 'admin'),
    productController.deleteProduct,
  );

exports.router = router;
