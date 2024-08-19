const Cart = require('../models/cartModel');
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

exports.putItemToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, itemId, quantity } = req.body;

  // Find the product by productId
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if the itemId exists within the product's items array
  const itemExists = product.items.some(
    (item) => item._id.toString() === itemId,
  );
  if (!itemExists) {
    return next(new AppError('Item not found in the specified product', 404));
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [{ productId, itemId, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.itemId.toString() === itemId,
    );

    if (itemIndex === -1) {
      cart.items.push({ productId, itemId, quantity });
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
  const { productId } = req.params;
  const cart = await Cart.findOne({ userId });
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

exports.deleteAllItemsFromCart = catchAsync(async (req, res, next) => {
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

//admin & manager
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
