const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/sucess`,
    cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
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
