const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    email: {
      type: String,
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
    totalItems: {
      type: Number,
    },
    shippingInformation: {
      fullName: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      province: {
        type: String,
      },
      district: {
        type: String,
      },
      ward: {
        type: String,
      },
      note: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'canceled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'cod'],
      required: true,
    },
    totalPrice: {
      type: Number,
    },
    sessionId: {
      type: String,
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

// orderSchema.pre(/^find/, async function (next) {
//   this.populate({
//     path: 'items.itemId',
//     populate: {
//       path: 'productId',
//       select: 'name',
//     },
//   });
//   next();
// });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
