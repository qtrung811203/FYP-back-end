const cron = require('node-cron');
const Product = require('../models/productModel');

const checkTime = cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  await Product.updateMany(
    { closeTime: { $lt: now }, status: 'active' },
    { status: 'inactive' },
  );
  console.log('Updated products status to inactive where closeTime is past.');
});

module.exports = checkTime;
