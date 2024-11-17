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
      Product.find().populate('items').populate('brand'),
      queryString,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    return await features.query;
  }

  async getAllProductsNew(skip, limit, brands, sortByPrice, searchQuery) {
    console.log('Brands: ' + brands);
    const hasBrands = brands ? true : false;
    const sortCondition =
      sortByPrice === 'asc' ? { minPrice: 1 } : { maxPrice: -1 };

    console.log(searchQuery);

    // Pipeline to get products with minPrice
    const pipelineProductsWithPrice = [
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
          minPrice: { $min: '$items.price' },
          maxPrice: { $max: '$items.price' },
        },
      },
    ];

    if (hasBrands) {
      const mergeBrands = brands.split(',');
      pipelineProductsWithPrice.push({
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand',
        },
      });
      pipelineProductsWithPrice.push({
        $match: { 'brand.name': { $in: mergeBrands } },
      });
    }

    if (searchQuery) {
      pipelineProductsWithPrice.push({
        $match: {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } }, // Search by name
            { description: { $regex: searchQuery, $options: 'i' } }, // Search by description
          ],
        },
      });
    }

    if (skip) {
      pipelineProductsWithPrice.push({
        $skip: skip,
      });
    } else if (limit) {
      pipelineProductsWithPrice.push({
        $limit: +limit,
      });
    }

    pipelineProductsWithPrice.push({
      $sort: sortCondition,
    });

    const products = await Product.aggregate(pipelineProductsWithPrice);
    return products;
  }

  //PRODUCTS BY BRAND (DONE)
  async getProductsByBrands(brands) {
    const mergeBrands = brands.split(',');
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand',
        },
      },
      {
        $unwind: '$brand',
      },
      {
        $match: { 'brand.name': { $in: mergeBrands } },
      },
    ]);
    return products;
  }

  //CREATE PRODUCT (DONE)
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
    const product = await Product.findOne({ slug: slug })
      .populate('items')
      .populate('brand');
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
        },
      },
      {
        $unwind: '$items',
      },
      {
        $sort: { 'items.price': 1 },
      },
      {
        $group: {
          _id: '$_id',
          items: { $push: '$items' },
          name: { $first: '$name' },
          slug: { $first: '$slug' },
          description: { $first: '$description' },
          imageCover: { $first: '$imageCover' },
          secondImage: { $first: '$secondImage' },
          images: { $first: '$images' },
          openTime: { $first: '$openTime' },
          type: { $first: '$type' },
          status: { $first: '$status' },
          closeTime: { $first: '$closeTime' },
          brand: { $first: '$brand' },
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
