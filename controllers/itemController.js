const Item = require('../models/itemModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const {
  getPublicIdCloudinary,
  deleteImgCloudinary,
} = require('../services/cloudinaryConfig');
const { uploadImageItem } = require('../services/multerConfig');

// MIDDLEWARE
exports.uploadImage = uploadImageItem.single('imageItem');
exports.updateImage = () =>
  catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return next(new AppError('No document found with that slug', 404));
    }
    upload = uploadImageItem.single('imageItem');
    upload(req, res, async (err) => {
      if (err) {
        return next(new AppError(err.message, 400));
      }
      next();
    });
  });

//Route
exports.getAllItems = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Item.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const items = await features.query;

  res.status(200).json({
    status: 'success',
    results: items.length,
    data: {
      items,
    },
  });
});

exports.createItem = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload imageItem', 400));
  }
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return next(new AppError('No product found with that slug', 404));
  }
  req.body.productId = product._id;
  req.body.imageItem = req.file.path;
  const item = await Item.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: item,
    },
  });
});

exports.getItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    return next(new AppError('No item found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      item,
    },
  });
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    return next(new AppError('No item found with that ID', 404));
  }
  if (req.file) {
    await deleteImgCloudinary(item.imageItem);
    req.body.imageItem = req.file.path;
  }
  const updated = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: updated,
    },
  });
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  const item = await Item.findOneAndDelete(req.params.id);
  if (!item) {
    return next(new AppError('No item found with that ID', 404));
  }
  console.log(item.imageItem);
  await deleteImgCloudinary(item.imageItem);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
