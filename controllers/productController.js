const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const { deleteImgCloudinary } = require('../services/cloudinaryConfig');
const { uploadImageProduct } = require('../services/multerConfig');

// MIDDLEWARE
exports.uploadImage = uploadImageProduct.single('imageCover');
exports.updateImage = () =>
  catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return next(new AppError('No document found with that slug', 404));
    }
    upload = uploadImageProduct.single('imageCover');
    upload(req, res, async (err) => {
      if (err) {
        return next(new AppError(err.message, 400));
      }
      next();
    });
  });

//ROUTES HANDLERS
exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Build query
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const products = await features.query;

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      data: products,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload imageCover', 400));
  }
  req.body.imageCover = req.file.path;
  const product = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: product,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('reviews')
    .populate('items');
  if (!product) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: product,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  // 1 - Check if imageCover not empty
  if (req.file) {
    // 2 - delete old imageCover and images
    const product = await Product.findOne({ slug: req.params.slug });
    deleteImgCloudinary(product.imageCover);
    req.body.imageCover = req.file.path;
  }

  const product = await Product.findOneAndUpdate(
    { slug: req.params.slug },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!product) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOneAndDelete({ slug: req.params.slug });
  deleteImgCloudinary(product.imageCover);

  if (!product) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//CUSTOM ROUTES
exports.getHomeProducts = catchAsync(async (req, res, next) => {
  //status in ['active', 'rerun']
  const statusCondition = { status: { $in: ['active', 'rerun'] } };

  //add secondImage to newProducts
  const addSecondImagePipeline = [
    {
      $lookup: {
        from: 'items',
        let: { productId: '$_id' }, //_id from product
        pipeline: [
          { $match: { $expr: { $eq: ['$productId', '$$productId'] } } },
          { $sort: { _id: 1 } },
          { $limit: 1 },
        ],
        as: 'firstItem',
      },
    },
    {
      $addFields: {
        secondImage: { $arrayElemAt: ['$firstItem.imageItem', 0] },
      },
    },
    { $project: { firstItem: 0 } }, //remove firstItem
  ];

  const newProducts = await Product.aggregate([
    { $match: statusCondition },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    ...addSecondImagePipeline,
  ]);

  const newMerch = await Product.aggregate([
    { $match: { ...statusCondition, type: 'merch' } },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    ...addSecondImagePipeline,
  ]);

  const almostEnd = await Product.aggregate([
    { $match: statusCondition },
    { $sort: { closeTime: 1 } },
    { $limit: 10 },
    ...addSecondImagePipeline,
  ]);

  // const products = await Product.find({ isHome: true });

  res.status(200).json({
    status: 'success',
    data: {
      newProducts,
      newMerch,
      almostEnd,
    },
  });
});
