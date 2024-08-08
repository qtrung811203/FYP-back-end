const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    imageCover: {
      type: String,
      default: 'default.jpg',
      //   required: [true, 'Product cover image is required'],
    },
  },
  {
    timestamps: true,
  },
);

Product = mongoose.model('Product', productSchema);
module.exports = Product;
