const express = require('express');
const brandController = require('../controllers/brandController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(brandController.getAllBrands);

router.use(authController.protect);
router.use(authController.inRole('admin'));
router.route('/').post(brandController.createBrand);
router
  .route('/:id')
  .get(brandController.getBrand)
  .patch(brandController.updateBrand)
  .delete(brandController.deleteBrand);

module.exports = router;
