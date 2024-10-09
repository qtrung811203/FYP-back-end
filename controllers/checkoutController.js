const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const hostUrl = req.headers.origin;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${hostUrl}/sucess/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${hostUrl}/cancel`,
    line_items: req.body.items.map((item) => {
      return {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: item.name,
            images: [item.imageItem],
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      };
    }),
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

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
