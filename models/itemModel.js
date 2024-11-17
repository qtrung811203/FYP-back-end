const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Product id is required'],
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Item category is required'],
  },
  imageItem: {
    type: String,
    required: [true, 'Item image is required'],
    default:
      'https://res.cloudinary.com/dje0spcns/image/upload/v1727022373/products/default.jpg',
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

itemSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.stock != null) {
    if (!update.$set) {
      update.$set = {};
    }
    update.$set.status = update.stock > 0 ? 'inStock' : 'outOfStock';
  }
  next();
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
