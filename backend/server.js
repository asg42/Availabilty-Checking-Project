// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};
connectDB();

// --- Mongoose Models ---
const Product = require('./models/Product');
const Store = require('./models/Store');
const UserInfo = require('./models/User'); // <<< IMPORTED UserInfo model

// --- Multer Setup for File Uploads ---
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file (e.g., JPEG, PNG).'), false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// --- Image Upload API Endpoint ---
app.post('/api/upload/product-image', upload.single('productImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "checkngo_products" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });
    res.status(200).json({
      message: 'Image uploaded successfully to Cloudinary!',
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('[UPLOAD ERROR] Error uploading to Cloudinary:', error);
    res.status(500).json({ message: 'Server error during image upload to Cloudinary.', errorDetails: error.message });
  }
});

// --- Product API Endpoints ---
// POST /api/products
app.post('/api/products', async (req, res) => {
    try {
        const { id, title, price, stock, thumbnail, images } = req.body;
        if (typeof id === 'undefined' || !title || typeof price === 'undefined' || typeof stock === 'undefined') {
            return res.status(400).json({ message: "Missing required fields: numeric 'id', 'title', 'price', 'stock' must be provided." });
        }
        if (isNaN(parseInt(String(id)))) {
             return res.status(400).json({ message: "Numeric 'id' must be a valid number." });
        }
        if (thumbnail && typeof thumbnail !== 'string') return res.status(400).json({ message: "Thumbnail must be a URL string."});
        if (images && (!Array.isArray(images) || !images.every(img => typeof img === 'string'))) return res.status(400).json({ message: "Images must be an array of URL strings."});

        const newProductData = { ...req.body, id: parseInt(String(id)) };
        const newProduct = new Product(newProductData);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        if (error.code === 11000) return res.status(409).json({ message: 'Product with this numeric ID already exists.', errorName: error.name, keyValue: error.keyValue });
        if (error.name === 'ValidationError') return res.status(400).json({ message: 'Validation failed.', errorName: error.name, errors: error.errors });
        res.status(500).json({ message: 'Error creating product.', errorName: error.name, errorDetails: error.message });
    }
});

// GET /api/products
app.get('/api/products', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) { query.title = { $regex: search, $options: 'i' }; }
        const products = await Product.find(query).sort({ title: 1 });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products.' });
    }
});

// GET /api/products/:_id
app.get('/api/products/:_id', async (req, res) => {
    const productIdFromUrl = req.params._id;
    try {
        const product = await Product.findById(productIdFromUrl);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        res.json(product);
    } catch (error) {
        console.error(`Error fetching product with _id '${productIdFromUrl}':`, error);
        if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid product ID format.' });
        res.status(500).json({ message: 'Error fetching product data.' });
    }
});

// PUT /api/products/:_id
app.put('/api/products/:_id', async (req, res) => {
    const productIdFromUrl = req.params._id;
    const updatePayload = req.body;
    if (Object.keys(updatePayload).length === 0) return res.status(400).json({ message: 'Update payload cannot be empty.' });
    if (updatePayload.thumbnail && typeof updatePayload.thumbnail !== 'string') return res.status(400).json({ message: "Thumbnail must be a URL string."});
    if (updatePayload.images && (!Array.isArray(updatePayload.images) || !updatePayload.images.every(img => typeof img === 'string'))) return res.status(400).json({ message: "Images must be an array of URL strings."});

    try {
        const updatedProduct = await Product.findByIdAndUpdate(productIdFromUrl, updatePayload, { new: true, runValidators: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found for update.' });
        res.json(updatedProduct);
    } catch (error) {
        console.error(`Error updating product with _id '${productIdFromUrl}':`, error);
        if (error.name === 'CastError' && error.path === '_id') return res.status(400).json({ message: 'Invalid product ID format.', errorName: error.name, errorDetails: error.message });
        if (error.code === 11000) return res.status(409).json({ message: 'Update conflicts with an existing unique ID.', errorName: error.name, keyValue: error.keyValue });
        if (error.name === 'ValidationError') return res.status(400).json({ message: 'Validation failed.', errorName: error.name, errors: error.errors });
        res.status(500).json({ message: 'Server error updating product data.', errorName: error.name, errorDetails: error.message });
    }
});

// DELETE /api/products/:_id
app.delete('/api/products/:_id', async (req, res) => {
    const productIdFromUrl = req.params._id;
    try {
        const deletedProduct = await Product.findByIdAndDelete(productIdFromUrl);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found for deletion.' });
        res.json({ message: 'Product deleted successfully.', product: deletedProduct });
    } catch (error) {
        console.error(`Error deleting product with _id '${productIdFromUrl}':`, error);
        if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid product ID format.' });
        res.status(500).json({ message: 'Error deleting product.' });
    }
});


// --- UserInfo API Endpoint ---
// GET /api/users - Fetch all users from usersinfo collection
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserInfo.find({});
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found in the usersinfo collection.' });
    }
    res.json(users); // This sends an array of user objects
  } catch (error) {
    console.error('Error fetching users from usersinfo collection:', error);
    res.status(500).json({ message: 'Server error fetching users data.', errorDetails: error.message });
  }
});


// --- Store API Endpoints ---
app.get('/api/stores', async (req, res) => {
    try {
        const stores = await Store.find({});
        res.json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Error fetching store data.' });
    }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    return res.status(400).json({ message: `File upload error: ${err.message}`, field: err.field });
  } else if (err.message && err.message.includes('Not an image!')) {
    console.error("File type validation error:", err.message);
    return res.status(400).json({ message: err.message });
  } else if (err) {
    console.error("Unhandled Express error:", err);
    return res.status(500).json({ message: "An unexpected server error occurred.", errorDetails: err.message });
  }
  next();
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
