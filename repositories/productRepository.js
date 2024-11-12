const Product = require('../models/productModel');
const Item = require('../models/itemModel');

const APIFeatures = require('../utils/apiFeatures');
const { deleteImgCloudinary } = require('../services/cloudinaryConfig');
const AppError = require('../utils/appError');

//UTILS FUNCTIONS
function deleteImgProduct(files) {
  if (files.imageCover) deleteImgCloudinary(files.imageCover[0].path);
  if (files.images) files.images.map((file) => deleteImgCloudinary(file.path));
}

//REPOSITORY
class ProductRepository {
  //ALL PRODUCTS
  async getAllProducts(queryString) {
    // Build query
    const features = new APIFeatures(
      Product.find().populate('items'),
      queryString,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    return await features.query;
  }

  //CREATE PRODUCT
  async createProduct(data, files, next) {
    if (!(files && files.imageCover && files.images)) {
      deleteImgProduct(files);
      return next(new AppError('Please upload image of product', 400));
    }

    data.imageCover = files.imageCover[0].path;
    data.images = files.images.map((file) => file.path);

    return Product.create(data)
      .then((product) => {
        return product;
      })
      .catch(async (err) => {
        deleteImgProduct(files);
        return next(new AppError(err.message, 400));
      });
  }

  //GET PRODUCT
  async getProduct(slug) {
    // const productQuery = Product.findOne({ slug: req.params.slug })
    //   .populate('reviews')
    //   .populate('items');
    const product = await Product.aggregate([
      {
        $match: { slug: slug },
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
          minPrice: { $min: '$items.price' }, // Tìm giá thấp nhất
        },
      },
      {
        $group: {
          _id: '$productInfo._id', // Gom lại tất cả các categories dưới cùng một sản phẩm
          categories: {
            $push: { category: '$_id', quantity: '$quantity', items: '$items' },
          }, // Tạo một mảng cho các category và items tương ứng
          productInfo: { $first: '$productInfo' }, // Lấy thông tin của sản phẩm
          minPrice: { $min: '$minPrice' }, // Tìm giá thấp nhất
        },
      },
      {
        $addFields: {
          'productInfo.secondImage': {
            $arrayElemAt: ['$productInfo.images', 0],
          },
          'productInfo.minPrice': '$minPrice',
        },
      },
      {
        $project: {
          productInfo: 1,
          categories: {
            $sortArray: {
              input: '$categories',
              sortBy: { category: -1 },
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            productInfo: {
              _id: '$productInfo._id',
              name: '$productInfo.name',
              slug: '$productInfo.slug',
              description: '$productInfo.description',
              ratingsAverage: '$productInfo.ratingsAverage',
              ratingsQuantity: '$productInfo.ratingsQuantity',
              imageCover: '$productInfo.imageCover',
              secondImage: '$productInfo.secondImage',
              images: '$productInfo.images',
              openTime: '$productInfo.openTime',
              type: '$productInfo.type',
              status: '$productInfo.status',
              closeTime: '$productInfo.closeTime',
              minPrice: '$productInfo.minPrice',
            },
            items: '$categories',
          },
        },
      },
    ]);
    return product;
  }

  //UPDATE PRODUCT
  async updateProduct(slug, data, files) {
    if (files) {
      const product = await Product.findOne({ slug: slug });
      const item = await Item.find({ productId: product._id });
      if (files.imageCover) {
        await deleteImgCloudinary(product.imageCover);
        data.imageCover = files.imageCover[0].path;
      }
      if (files.images) {
        if (item.length > 0) {
          item.map((i) => {
            i.imageItem =
              'https://res.cloudinary.com/dje0spcns/image/upload/v1727022373/products/default.jpg';
            i.save();
          });
        }
        Promise.all(product.images.map((img) => deleteImgCloudinary(img)));
        data.images = files.images.map((file) => file.path);
      }
    }

    const product = await Product.findOneAndUpdate({ slug: slug }, data, {
      new: true,
      runValidators: true,
    }).populate('items');

    return product;
  }

  //DELETE PRODUCT
  async deleteProduct(slug) {
    const product = await Product.findOneAndDelete({ slug: slug });
    await Item.deleteMany({ productId: product._id });
    await deleteImgCloudinary(product.imageCover);
    await Promise.all(product.images.map((img) => deleteImgCloudinary(img)));
    return product;
  }

  //GET HOME PRODUCTS
  async getHomeProducts() {
    const statusCondition = { status: { $in: ['active', 'rerun'] } };
    //add secondImage to newProducts
    const addSecondImagePipeline = [
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'productId',
          as: 'items',
        },
      },
      {
        $addFields: {
          secondImage: { $arrayElemAt: ['$images', 0] },
          minPrice: { $min: '$items.price' },
        },
      },
      {
        $project: {
          images: 0,
        },
      },
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

    return { newProducts, newMerch, almostEnd };
  }
}
module.exports = new ProductRepository();
