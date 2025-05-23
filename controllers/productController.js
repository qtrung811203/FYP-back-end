const ProductRepository = require('../repositories/productRepository');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { uploadImageProduct } = require('../services/multerConfig');

// MIDDLEWARE TO UPLOAD IMAGE
exports.uploadImage = uploadImageProduct.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images' },
]);

exports.updateImage = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return next(new AppError('No document found with that slug', 404));
  }
  upload = uploadImageProduct.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images' },
  ]);
  upload(req, res, async (err) => {
    if (err) {
      return next(new AppError(err.message, 400));
    }
    next();
  });
});

//ROUTES HANDLERS
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { page, limit, brands = '', searchQuery = '', sortByPrice } = req.query;
  const totalProducts = await Product.countDocuments();
  const totalPages = Math.ceil(totalProducts / limit);

  const skip = (page - 1) * limit;

  const products = await ProductRepository.getAllProductsNew(
    skip,
    limit,
    brands,
    sortByPrice,
    searchQuery,
  );

  res.status(200).json({
    status: 'success',
    results: products.length,
    totalPages,
    currentPage: page,
    data: products,
  });

  //FILTER BY BRANDS
  // if (brands) {
  //   const products = await ProductRepository.getProductsByBrands(brands);
  //   return res.status(200).json({
  //     status: 'success',
  //     results: products.length,
  //     totalPages,
  //     currentPage: page,
  //     data: products,
  //   });
  // }

  //GET ALL PRODUCTS
  // const products = await ProductRepository.getAllProducts(req.query);
  // res.status(200).json({
  //   status: 'success',
  //   results: products.length,
  //   totalPages,
  //   currentPage: page,
  //   data: products,
  // });
});

// POST /api/v1/products
exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await ProductRepository.createProduct(
    req.body,
    req.files,
    next,
  );

  if (!product) {
    return;
  }

  res.status(201).json({
    status: 'success',
    data: product,
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await ProductRepository.getProduct(req.params.slug);

  if (!product) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await ProductRepository.updateProduct(
    req.params.slug,
    req.body,
    req.files,
  );
  if (!product) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: product,
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
//GET /api/v1/products/home
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

//GET /api/v1/products/dashboard
exports.getDashboardProducts = catchAsync(async (req, res, next) => {
  const { totalOrders, totalSales, totalProducts, totalUsers } =
    await ProductRepository.getDashboardProducts();

  res.status(200).json({
    status: 'success',
    data: {
      totalOrders,
      totalSales,
      totalProducts,
      totalUsers,
    },
  });
});

//GET /api/v1/products/last-7-days-sales
exports.getLast7DaysSales = catchAsync(async (req, res, next) => {
  const last7DaysSales = await ProductRepository.getLast7DaysSales();

  res.status(200).json({
    status: 'success',
    data: last7DaysSales,
  });
});
