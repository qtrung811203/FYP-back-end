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
  // const productQuery = Product.findOne({ slug: req.params.slug })
  //   .populate('reviews')
  //   .populate('items');

  // Group items by category
  const product = await Product.aggregate([
    {
      $match: { slug: req.params.slug },
    },
    {
      $lookup: {
        from: 'items',
        localField: '_id',
        foreignField: 'productId',
        as: 'items',
      },
    },
    {
      //Tách các item ra khỏi mảng items
      $unwind: {
        path: '$items',
        preserveNullAndEmptyArrays: true, // Giữ sản phẩm ngay cả khi không có items
      },
    },
    {
      $group: {
        _id: '$items.category', // Nhóm các item theo category
        items: { $push: '$items' }, // Gom các item cùng category vào một mảng
        quantity: { $sum: 1 }, // Đếm số lượng item
        productInfo: { $first: '$$ROOT' }, // Giữ thông tin của sản phẩm
      },
    },
    {
      $group: {
        _id: '$productInfo._id', // Gom lại tất cả các categories dưới cùng một sản phẩm
        categories: {
          $push: { category: '$_id', quantity: '$quantity', items: '$items' },
        }, // Tạo một mảng cho các category và items tương ứng
        productInfo: { $first: '$productInfo' }, // Lấy thông tin của sản phẩm
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          productInfo: {
            name: '$productInfo.name',
            slug: '$productInfo.slug',
            description: '$productInfo.description',
            ratingsAverage: '$productInfo.ratingsAverage',
            ratingsQuantity: '$productInfo.ratingsQuantity',
            imageCover: '$productInfo.imageCover',
            openTime: '$productInfo.openTime',
            type: '$productInfo.type',
            status: '$productInfo.status',
          },
          items: '$categories', // Đặt các category đã nhóm vào trường items
        },
      },
    },
  ]);

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
