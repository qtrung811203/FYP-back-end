const mongoose = require('mongoose');
// const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxLength: [100, 'Product name must not exceed 100 characters'],
      minLength: [5, 'Product name must be at least 5 characters long'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxLength: [500, 'Product description must not exceed 500 characters'],
      minLength: [5, 'Product description must be at least 20 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price must be greater than 0'],
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
      min: [0, 'Rating quantity must be greater than 0'],
      max: [5, 'Rating quantity must be less than 5'],
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

// productSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

Product = mongoose.model('Product', productSchema);
module.exports = Product;
