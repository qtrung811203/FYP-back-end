const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Order = require('../models/orderModel');

//Tạo checkout session và trả về session id
exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { user, items } = req.body;
  const hostUrl = req.headers.origin;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${hostUrl}/checkout/success?sessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${hostUrl}/checkout/cancel`,
    customer_email: user.email,
    metadata: {
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      province: user.province,
      district: user.district,
      ward: user.ward,
      note: user.note,
    },
    line_items: items.map((item) => {
      return {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: item.name,
            images: [item.imageItem],
            metadata: {
              itemId: item._id,
              productId: item.productId,
            },
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      };
    }),
  });

  console.log('session', session.id);

  if (!session) {
    return next(new AppError('Cannot create checkout session', 500));
  }

  res.status(200).json({
    status: 'success',
    sessionId: session.id,
  });
});

//Handle checkout success
exports.handleCheckoutSuccess = catchAsync(async (req, res, next) => {
  //Get checkout session id
  const { sessionId } = req.query;

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price.product'],
  });

  //Check order if exists
  const orderExists = await Order.findOne({ sessionId: sessionId });
  if (orderExists) {
    return res.status(200).json({
      status: 'success',
      session,
      order: orderExists,
    });
  }

  const orderItems = session.line_items.data.map((lineItem) => {
    return {
      itemId: lineItem.price.product.metadata.itemId,
      quantity: lineItem.quantity,
    };
  });

  const { email, ...shippingInformation } = session.metadata;

  // Create order and save to database
  const order = await Order.create({
    email: session.customer_email,
    //write to save items with id and product id from metadata
    items: orderItems,
    totalPrice: session.amount_total,
    shippingInformation: shippingInformation,
    status: 'paid',
    paymentMethod: 'stripe',
    sessionId: session.id,
  });
  //Send email

  //Send response
  res.status(200).json({
    status: 'success',
    session,
    order,
  });
});

//Handle stripe webhook
//Do in future

//Handle cash on delivery
exports.handleCodCheckout = catchAsync(async (req, res, next) => {
  //Create order and save to database
  //Send email
  //Send response
  res.status(200).json({
    status: 'success',
  });
});
