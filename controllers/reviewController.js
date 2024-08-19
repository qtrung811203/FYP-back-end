const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Middleware to check if the user is the owner of the review
exports.checkUserReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (req.user.id !== review.user.id) {
    return next(new AppError('You can only edit your comment!', 403));
  }
  next();
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.slug) {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return next(new AppError('No product found with that slug', 404));
    }
    filter = { product: product._id };
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return next(new AppError('No product found with that slug', 404));
  }

  if (!req.body.product) req.body.product = product._id;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return next(new AppError('No product found with that slug', 404));
  }

  const review = await Review.findOneAndUpdate(
    { _id: req.params.reviewId, product: product._id },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!review) {
    return next(
      new AppError(
        'No review found with that ID for the specified product',
        404,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
