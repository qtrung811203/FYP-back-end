const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const cloudinary = require('../services/cloudinaryConfig');
const { uploadImagesProduct } = require('../services/multerConfig');

// MIDDLEWARE
exports.uploadProductImageCover = uploadImagesProduct.single('imageCover');

exports.updateProductImageCover = async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return next(new AppError('No document found with that slug', 404));
  }
  return uploadImagesProduct.single('imageCover');
};

// HELPER FUNCTIONS
const getPublicIdCloudinary = (cloudUrl) => {
  const [, , , , , , , folder, fileNameWithExt] = cloudUrl.split('/');
  const fileName = fileNameWithExt.split('.')[0];
  return `${folder}/${fileName}`;
};

const deleteImgCloudinary = async (imgCoverUrl, imgs) => {
  const imgCoverId = getPublicIdCloudinary(imgCoverUrl);
  await cloudinary.uploader.destroy(imgCoverId);
  // if (imgs.length > 0) {
  //   const imgsId = imgs.map((img) => getPublicIdCloudinary(img));
  //   imgsId.forEach(async (imgId) => {
  //     await cloudinary.uploader.destroy(imgId);
  //   });
  // }
};

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
  if (!req.files.imageCover) {
    return next(new AppError('Please upload imageCover and images', 400));
  }
  req.body.imageCover = req.files.imageCover[0].path;
  const product = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: product,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    'reviews',
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

exports.updateProduct = catchAsync(async (req, res, next) => {
  // 1 - Check if imageCover and images are not empty
  // console.log(req.files);
  if (req.files.imageCover) {
    // 2 - delete old imageCover and images
    const product = await Product.findOne({ slug: req.params.slug });
    deleteImgCloudinary(product.imageCover);
    req.body.imageCover = req.files.imageCover[0].path;
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
  const product = await Product.findByIdAndDelete(req.params.id);
  deleteImgCloudinary(product.imageCover, product.images);

  if (!product) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.addItemToProduct = catchAsync(async (req, res, next) => {});
