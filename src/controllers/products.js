const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Helper function to delete images
const deleteImages = (images) => {
  images.forEach(image => {
    fs.unlink(path.join(__dirname, '..', 'uploads', image), (err) => {
      if (err) console.error(err);
    });
  });
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { country } = req.query;
    const products = country ? await Product.find({ 'variants.country': country }) : await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  const { name, description, modelNumber, sku, variants } = req.body;
  const variantData = JSON.parse(variants).map((variant, index) => ({
    ...variant,
    image: req.files[index] ? req.files[index].filename : '',
  }));

  const product = new Product({ name, description, modelNumber, sku, variants: variantData });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update product and variants
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, modelNumber, sku, variants } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (modelNumber) product.modelNumber = modelNumber;
    if (sku) product.sku = sku;

    const variantData = JSON.parse(variants).map((variant, index) => ({
      ...variant,
      image: req.files[index] ? req.files[index].filename : variant.image,
    }));

    product.variants = variantData;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product and its variants
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete images
    const images = product.variants.map(variant => variant.image);
    deleteImages(images);

    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete variant
exports.deleteVariant = async (req, res) => {
  try {
    const product = await Product.findOne({ 'variants._id': req.params.id });
    if (!product) return res.status(404).json({ message: 'Variant not found' });

    const variant = product.variants.id(req.params.id);
    if (variant.image) {
      fs.unlink(path.join(__dirname, '..', 'uploads', variant.image), (err) => {
        if (err) console.error(err);
      });
    }

    variant.remove();
    await product.save();
    res.json({ message: 'Variant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
