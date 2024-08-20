const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Item',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    note: {
      type: String,
    },
    totalPrice: {
      type: Number,
    },
    totalQuantity: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

cartSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'items.itemId',
  });
  next();
});

//Calculate total price and total quantity
cartSchema.pre('save', async function (next) {
  let totalPrice = 0;
  let totalQuantity = 0;
  await this.populate({ path: 'items.itemId' });
  this.items.forEach((item) => {
    totalPrice += item.itemId.price * item.quantity;
    totalQuantity += item.quantity;
  });
  this.totalPrice = totalPrice;
  this.totalQuantity = totalQuantity;
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
