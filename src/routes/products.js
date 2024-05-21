const express = require('express');
const multer = require('multer');
const path = require('path');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteVariant } = require('../controllers/products');

const router = express.Router();

// Setup multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// API Endpoints
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', upload.array('images'), createProduct);
router.put('/:id', upload.array('images'), updateProduct);
router.delete('/:id', deleteProduct);
router.delete('/variant/:id', deleteVariant);

module.exports = router;
