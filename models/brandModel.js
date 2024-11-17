const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a brand name'],
    trim: true,
  },
});

const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
