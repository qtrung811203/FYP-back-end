const ProductRepository = require('../repositories/productRepository');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { deleteImgCloudinary } = require('../services/cloudinaryConfig');
const { uploadImageProduct } = require('../services/multerConfig');

// MIDDLEWARE
exports.uploadImage = uploadImageProduct.single('imageCover');

exports.updateImage = catchAsync(async (req, res, next) => {
  console.log('updateImage');
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
  const products = await ProductRepository.getAllProducts(req.query);
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
  const product = await ProductRepository.createProduct(
    req.body,
    req.file.path,
  );
  res.status(201).json({
    status: 'success',
    data: {
      data: product,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await ProductRepository.getProduct(req.params.slug);

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
  const product = await ProductRepository.updateProduct(
    req.params.slug,
    req.body,
    req.file,
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
  const product = await ProductRepository.deleteProduct(req.params.slug);

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
  const { newProducts, newMerch, almostEnd } =
    await ProductRepository.getHomeProducts();

  res.status(200).json({
    status: 'success',
    data: {
      newProducts,
      newMerch,
      almostEnd,
    },
  });
});
