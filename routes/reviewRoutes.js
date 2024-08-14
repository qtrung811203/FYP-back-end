const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// api/v1/products/:productId/reviews (nested route)
// api/v1/reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.inRole('user', 'admin'),
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.inRole('user', 'admin'),
    reviewController.checkUserReview,
    reviewController.updateReview,
  )
  .delete(
    authController.protect,
    authController.inRole('user', 'admin'),
    reviewController.checkUserReview,
    reviewController.deleteReview,
  );

module.exports = router;
