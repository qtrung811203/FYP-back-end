const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Order = require('../models/orderModel');

exports.createCodOrder = catchAsync(async (req, res, next) => {
  const { user, items } = req.body;

  const order = await Order.create({
    email: user.email,
    items: items.map((item) => ({
      itemId: item._id,
      quantity: item.quantity,
    })),
    totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
    paymentMethod: 'cod',
    totalPrice: items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    ),
    status: 'pending',
    shippingInformation: {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      province: user.province,
      district: user.district,
      ward: user.ward,
      note: user.note,
    },
  });

  if (!order) {
    return next(new AppError('Cannot create order', 500));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: {
        _id: order._id,
        totalPrice: order.totalPrice,
        totalItems: order.totalItems,
      },
    },
  });
});

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
