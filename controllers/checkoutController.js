const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { meta } = require('eslint-plugin-prettier');

//Tạo checkout session và trả về session id
exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { user, items } = req.body;
  const hostUrl = req.headers.origin;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${hostUrl}/checkout/success/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${hostUrl}/checkout/cancel/{CHECKOUT_SESSION_ID}`,
    customer_email: user.email,
    metadata: {
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      province: user.province,
      district: user.district,
      ward: user.ward,
    },
    line_items: items.map((item) => ({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: item.name,
          images: [item.imageItem],
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    })),
  });

  res.status(200).json({
    status: 'success',
    sessionId: session.id,
  });
});

//Lấy thông tin của checkout session
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    return next(new AppError('No session found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    session,
  });
});

//Unfinished
exports.checkSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    return next(new AppError('No session found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    session,
  });
});
