const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Order = require('../models/orderModel');

const sendEmail = require('../utils/email');
const crypto = require('crypto');

const createInvoiceTemplate = require('../templates/invoiceTemplate');
const createCodCheckoutTemplate = require('../templates/confirmCodCheckoutTemplate');

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
    totalItems: session.line_items.data.reduce(
      (acc, lineItem) => acc + lineItem.quantity,
      0,
    ),
    shippingInformation: shippingInformation,
    status: 'paid',
    paymentMethod: 'stripe',
    sessionId: session.id,
  }).then((order) => {
    return order.populate('items.itemId');
  });

  //Send email
  const invoiceTemplate = createInvoiceTemplate(order);
  try {
    await sendEmail({
      email: order.email,
      subject: 'Your order',
      html: invoiceTemplate,
    });
  } catch (err) {
    return next(new AppError('Cannot send email', 500));
  }

  //Send response
  res.status(200).json({
    status: 'success',
    session,
    order,
  });
});

//Handle stripe webhook
//Do in future

//Handle cash on delivery (receive order and send email for user confirmation)
exports.handleCodCheckout = catchAsync(async (req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex');
  const confirmUrl = `${req.headers.origin}/checkout/cod-success/${token}`;

  //Create order and save to database
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
    confirmationToken: token,
  });

  if (!order) {
    return next(new AppError('Cannot create order', 500));
  }
  //Send email
  const codTemplate = createCodCheckoutTemplate(confirmUrl);
  // const message = `Please confirm your order by clicking the link: ${confirmUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Confirm your order',
      html: codTemplate,
    });
  } catch (err) {
    return next(new AppError('Cannot send email', 500));
  }

  //Send response
  res.status(200).json({
    status: 'success',
    data: {
      order: {
        order,
      },
    },
  });
});

//Handle cod confirm
exports.handleCodConfirm = catchAsync(async (req, res, next) => {
  //Update order status
  const { token } = req.params;
  const order = await Order.findOneAndUpdate(
    { confirmationToken: token, status: 'pending' },
    { status: 'confirmed', confirmationToken: undefined },
    { new: true },
  ).populate('items.itemId');

  if (!order) {
    return next(new AppError('Invalid token', 400));
  }

  console.log(order);

  //Send email
  const invoiceTemplate = createInvoiceTemplate(order);

  try {
    await sendEmail({
      email: order.email,
      subject: 'Your order',
      html: invoiceTemplate,
    });
  } catch (err) {
    return next(new AppError('Cannot send email', 500));
  }

  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

  //Send response
  res.status(200).json({
    status: 'success',
    data: {
      order: {
        _id: order._id,
        totalPrice: order.totalPrice,
        totalItems,
      },
    },
  });
});
