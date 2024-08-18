const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const cloudinary = require('../services/cloudinaryConfig');
const {
  uploadImageProduct,
  uploadImageItem,
} = require('../services/multerConfig');

// MIDDLEWARE
//imageCover
exports.uploadProductImageCover = uploadImageProduct.single('imageCover');
exports.updateProductImageCover = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return next(new AppError('No document found with that slug', 404));
  }
  const upload = uploadImageProduct.single('imageCover');
  upload(req, res, async (err) => {
    if (err) {
      return next(new AppError(err.message, 400));
    }
    next();
  });
});

//ItemImages
exports.uploadImageItem = uploadImageItem.single('imageItem');

// HELPER FUNCTIONS
const getPublicIdCloudinary = (cloudUrl) => {
  const [, , , , , , , folder, fileNameWithExt] = cloudUrl.split('/');
  const fileName = fileNameWithExt.split('.')[0];
  return `${folder}/${fileName}`;
};

const deleteImgCloudinary = async (imgCoverUrl) => {
  const imgCoverId = getPublicIdCloudinary(imgCoverUrl);
  console.log(imgCoverId);
  await cloudinary.uploader.destroy(imgCoverId);
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

//Items
exports.addItemToProduct = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload imageItem', 400));
  }
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return next(new AppError('No document found with that slug', 404));
  }
  req.body.imageItem = req.file.path;
  product.items.push(req.body);
  await product.save();

  res.status(201).json({
    status: 'success',
    data: {
      data: product,
    },
  });
});
