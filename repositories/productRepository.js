const Product = require('../models/productModel');
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
    const features = new APIFeatures(Product.find(), queryString)
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
    return product;
  }

  //UPDATE PRODUCT
  async updateProduct(slug, data, files) {
    if (files) {
      const product = await Product.findOne({ slug: slug });
      console.log(product);
      if (files.imageCover) {
        await deleteImgCloudinary(product.imageCover);
        data.imageCover = files.imageCover[0].path;
      }
      if (files.images) {
        Promise.all(product.images.map((img) => deleteImgCloudinary(img)));
        data.images = files.images.map((file) => file.path);
      }
    }

    const product = await Product.findOneAndUpdate({ slug: slug }, data, {
      new: true,
      runValidators: true,
    });

    return product;
  }

  //DELETE PRODUCT
  async deleteProduct(slug) {
    const product = await Product.findOneAndDelete({ slug: slug });
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

    return { newProducts, newMerch, almostEnd };
  }
}
module.exports = new ProductRepository();
