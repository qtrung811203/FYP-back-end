const Cart = require('../models/cartModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      products: [{ productId, quantity }],
    });
  } else {
    const productIndex = cart.products.findIndex(
      (product) => product.productId.id === productId,
    );

    if (productIndex === -1) {
      cart.products.push({ productId, quantity });
    } else {
      cart.products[productIndex].quantity = quantity;
    }
  }

  await cart.save();
  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
});

exports.updateCart = catchAsync(async (req, res, next) => {
  //update note
  const userId = req.user.id;
  console.log(userId);
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

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const cart = await Cart.findOne({ userId });
  console.log(cart);
  if (!cart) {
    return next(new AppError('No cart found with that ID', 404));
  }
  cart.products = cart.products.filter(
    (product) => product.productId.id !== productId,
  );
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
});

exports.deleteCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError('No cart found with that ID', 404));
  }

  cart.products = [];
  cart.note = '';

  await cart.save();
  res.status(200).json({
    status: 'success',
    data: cart,
  });
});
