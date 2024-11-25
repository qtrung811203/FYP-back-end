const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Order = require('../models/orderModel');

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ email: req.user.email })
    .populate('items.itemId')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      orders,
    },
  });
});

exports.getOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find().populate('items.itemId').sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      orders,
    },
  });
});

exports.getOrdersToday = catchAsync(async (req, res, next) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    createdAt: { $gte: startOfDay, $lt: endOfDay },
    status: { $in: ['confirmed', 'paid'] },
  })
    .populate('items.itemId')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      orders,
    },
  });
});
