const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  color: String,
  quantity: Number,
  price: Number,
  country: String,
  image: String,
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  modelNumber: String,
  sku: String,
  variants: [variantSchema],
});

module.exports = mongoose.model('Product', productSchema);
