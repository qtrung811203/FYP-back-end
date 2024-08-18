const mongoose = require('mongoose');
const slugify = require('slugify');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Item category is required'],
  },
  imageItem: {
    type: String,
    required: [true, 'Item image is required'],
  },
  price: {
    type: Number,
    required: [true, 'Item price is required'],
  },
  maxBuy: {
    type: Number,
  },
  stock: {
    type: Number,
    required: [true, 'Item stock is required'],
  },
  status: {
    type: String,
    enum: ['inStock', 'outOfStock'],
    default: function () {
      return this.stock > 0 ? 'inStock' : 'outOfStock';
    },
  },
});

itemSchema.pre('save', function (next) {
  if (this.isModified('stock')) {
    this.status = this.stock > 0 ? 'inStock' : 'outOfStock';
  }
  next();
});

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
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Product description is required'],
      minLength: [5, 'Product description must be at least 20 characters'],
      maxLength: [500, 'Product description must not exceed 500 characters'],
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be less than 5'],
      default: 1,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    imageCover: {
      type: String,
      required: [true, 'Product image is required'],
    },
    openTime: {
      type: Date,
      required: [true, 'Product open time is required'],
      default: Date.now(),
    },
    closeTime: {
      type: Date,
    },
    type: {
      type: String,
      enum: ['merch', 'digital'],
      default: 'merch',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'rerun'],
      default: 'active',
    },
    items: [itemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.pre('save', function (next) {
  if (this.closeTime && this.openTime && this.closeTime <= this.openTime) {
    return next(new Error('Close time must be after open time'));
  }
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (
    update.closeTime &&
    update.openTime &&
    update.closeTime <= update.openTime
  ) {
    return next(new Error('Close time must be after open time'));
  }
  next();
});

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

Product = mongoose.model('Product', productSchema);
module.exports = Product;
