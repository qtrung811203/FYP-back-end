const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Order = require('../models/orderModel');

exports.createCodOrder = catchAsync(async (req, res, next) => {
  console.log('hi');
  const { user, items } = req.body;

  const order = await Order.create({
    email: user.email,
    items: items.map((item) => ({
      itemId: item._id,
      quantity: item.quantity,
    })),
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
      order,
    },
  });
});
