const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Brand = require('../models/brandModel');

exports.getAllBrands = catchAsync(async (req, res, next) => {
  const brands = await Brand.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'brand',
        as: 'products',
      },
    },
    {
      $project: {
        name: 1,
        count: {
          $size: '$products',
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: brands.length,
    data: {
      brands,
    },
  });
});

exports.createBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      brand,
    },
  });
});

exports.getBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      brand,
    },
  });
});

exports.updateBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!brand) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      brand,
    },
  });
});

exports.deleteBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);

  if (!brand) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
