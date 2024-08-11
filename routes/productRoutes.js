const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

//api/v1/products
router
  .route('/')
  .get(authController.protect, productController.getAllProducts)
  .post(productController.createProduct);

//api/v1/products/:id
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

exports.router = router;
