const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//user
exports.getMyCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId });
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
});

exports.addItemToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { itemId, quantity } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [{ itemId, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.itemId._id.toString() === itemId,
    );

    if (itemIndex === -1) {
      cart.items.push({ itemId, quantity });
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
  }

  await cart.save();
  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

exports.updateCart = catchAsync(async (req, res, next) => {
  //update note
  const userId = req.user.id;
  const { note } = req.body;
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { note },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!cart) {
    return next(new AppError('No cart found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
});

exports.deleteOneItemFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError('No cart found with that ID', 404));
  }
  cart.items = cart.items.filter(
    (item) => item.itemId._id.toString() !== itemId,
  );

  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
});

exports.deleteAllItemsFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError('No cart found with that ID', 404));
  }

  cart.items = [];
  cart.note = '';

  await cart.save();
  res.status(200).json({
    status: 'success',
    data: cart,
  });
});

//admin & manager
exports.getAllCarts = catchAsync(async (req, res, next) => {
  const carts = await Cart.find();
  res.status(200).json({
    status: 'success',
    results: carts.length,
    data: {
      data: carts,
    },
  });
});

exports.getOneCart = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cart = await Cart.findById(id);
  if (!cart) {
    return next(new AppError('No cart found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
});

exports.deleteCart = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cart = await Cart.findByIdAndDelete(id);
  if (!cart) {
    return next(new AppError('No cart found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
