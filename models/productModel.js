const mongoose = require('mongoose');
// const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'Product name is required'],
      minLength: [5, 'Product name must be at least 5 characters long'],
      maxLength: [100, 'Product name must not exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Product description is required'],
      minLength: [5, 'Product description must be at least 20 characters'],
      maxLength: [500, 'Product description must not exceed 500 characters'],
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
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be less than 5'],
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

// productSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

Product = mongoose.model('Product', productSchema);
module.exports = Product;
