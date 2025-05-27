// backend/server.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

mongoose.set('debug', true); // <<<< THIS IS CRITICAL FOR THE NEXT STEP

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json()); // Modern Express way to parse JSON bodies

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};
connectDB();

// Import Mongoose Models
const Product = require('./models/Product');
const Store = require('./models/Store'); // Assuming Store model exists and is used

// --- Product API Endpoints ---

// POST /api/products - Create a new product
app.post('/api/products', async (req, res) => {
    console.log("[POST /api/products] Received request to create product."); // DEBUG
    console.log("[POST /api/products] Request body:", JSON.stringify(req.body, null, 2)); // DEBUG
    try {
        const { id, title, price, stock } = req.body;
        if (typeof id === 'undefined' || !title || typeof price === 'undefined' || typeof stock === 'undefined') {
            console.log("[POST /api/products] Validation Error: Missing required fields."); // DEBUG
            return res.status(400).json({ message: "Missing required fields: numeric 'id', 'title', 'price', 'stock' must be provided." });
        }
        if (isNaN(parseInt(String(id)))) {
             console.log("[POST /api/products] Validation Error: Numeric 'id' is not a valid number."); // DEBUG
             return res.status(400).json({ message: "Numeric 'id' must be a valid number." });
        }
        // Ensure numeric id is an integer in the data to be saved
        const newProductData = { ...req.body, id: parseInt(String(id)) };

        const newProduct = new Product(newProductData);
        const savedProduct = await newProduct.save();
        console.log("[POST /api/products] Product created successfully:", savedProduct._id); // DEBUG
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('[POST /api/products] Error creating product:', error); // Keep detailed error log
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'Product with this numeric ID already exists.', errorName: error.name, errorCode: error.code, keyValue: error.keyValue });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation failed.', errorName: error.name, errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating product.', errorName: error.name, errorDetails: error.message });
    }
});

// GET /api/products - Fetch all products (with optional title search)
app.get('/api/products', async (req, res) => {
    // console.log("[GET /api/products] Received request to fetch all products."); // DEBUG (can be verbose)
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' };
            // console.log("[GET /api/products] Searching with title regex:", query.title); // DEBUG
        }
        const products = await Product.find(query).sort({ title: 1 });
        // console.log(`[GET /api/products] Found ${products.length} products.`); // DEBUG
        res.json(products);
    } catch (error) {
        console.error('[GET /api/products] Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products.' });
    }
});

// GET /api/products/:_id - Fetch a single product by its MongoDB _id
app.get('/api/products/:_id', async (req, res) => {
    const productIdFromUrl = req.params._id;
    console.log(`[GET /api/products/:_id] Attempting to find product with _id: '${productIdFromUrl}'`);
    console.log(`[GET /api/products/:_id] Type: ${typeof productIdFromUrl}, Length: ${productIdFromUrl.length}`);

    try {
        const product = await Product.findById(productIdFromUrl);
        if (!product) {
            console.log(`[GET /api/products/:_id] Product NOT FOUND for _id: '${productIdFromUrl}'`);
            return res.status(404).json({ message: 'Product not found.' });
        }
        console.log(`[GET /api/products/:_id] Product FOUND for _id: '${productIdFromUrl}'`);
        res.json(product);
    } catch (error) {
        console.error(`[GET /api/products/:_id] Error fetching product with _id '${productIdFromUrl}':`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID format provided for _id lookup.' });
        }
        res.status(500).json({ message: 'Error fetching product data.' });
    }
});

// PUT /api/products/:_id - Update an existing product by its MongoDB _id
app.put('/api/products/:_id', async (req, res) => {
    const productIdFromUrl = req.params._id;
    const updatePayload = req.body;

    console.log(`[PUT /api/products/:_id] Received request to update _id: '${productIdFromUrl}'`);
    console.log(`[PUT /api/products/:_id] Type of productIdFromUrl: ${typeof productIdFromUrl}, Length: ${productIdFromUrl ? productIdFromUrl.length : 'undefined'}`);
    console.log(`[PUT /api/products/:_id] Full Update payload received:`, JSON.stringify(updatePayload, null, 2));

    if (!productIdFromUrl || typeof productIdFromUrl !== 'string' || productIdFromUrl.length !== 24) {
        // Basic check for ObjectId-like string format, Mongoose CastError is more definitive
        console.warn(`[PUT /api/products/:_id] Received potentially invalid _id format in URL: '${productIdFromUrl}'`);
        // Let CastError handle it for more precise error if it's a Mongoose issue.
    }


    if (Object.keys(updatePayload).length === 0) {
        console.log("[PUT /api/products/:_id] Error: Update payload is empty.");
        return res.status(400).json({ message: 'Update payload cannot be empty.' });
    }

    try {
        // Explicitly try to find the document first for debugging
        console.log(`[PUT /api/products/:_id] Attempting pre-update findById with: '${productIdFromUrl}'`);
        const productExists = await Product.findById(productIdFromUrl).lean(); // .lean() for a plain JS object

        if (!productExists) {
            console.log(`[PUT /api/products/:_id] PRE-UPDATE CHECK: Product with _id '${productIdFromUrl}' NOT FOUND by findById.`);
            // Optional: Try a more direct query if findById is being tricky, this helps isolate the issue
            const directQueryProduct = await Product.findOne({ _id: productIdFromUrl }).lean();
            if (!directQueryProduct) {
                console.log(`[PUT /api/products/:_id] PRE-UPDATE CHECK: Product with _id '${productIdFromUrl}' NOT FOUND by findOne({_id: ...}) either.`);
            } else {
                console.log(`[PUT /api/products/:_id] PRE-UPDATE CHECK: Product FOUND by findOne({_id: ...}). This is strange if findById failed.`);
            }
            return res.status(404).json({ message: 'Product not found for pre-update check. Verify _id.' });
        }
        console.log(`[PUT /api/products/:_id] PRE-UPDATE CHECK: Product with _id '${productIdFromUrl}' FOUND by findById.`);
        // console.log(`[PUT /api/products/:_id] Document found details by pre-check:`, JSON.stringify(productExists, null, 2));


        console.log(`[PUT /api/products/:_id] Proceeding with findByIdAndUpdate for _id: '${productIdFromUrl}'`);
        const updatedProduct = await Product.findByIdAndUpdate(
            productIdFromUrl,
            updatePayload,
            { new: true, runValidators: true } // Return updated doc, run schema validators
        );

        if (updatedProduct) {
            console.log(`[PUT /api/products/:_id] Product updated successfully for _id: '${productIdFromUrl}'`);
            res.json(updatedProduct);
        } else {
            // This is the block that would send a 404 if findByIdAndUpdate itself returns null
            console.log(`[PUT /api/products/:_id] findByIdAndUpdate returned null for _id: '${productIdFromUrl}'. (This means it didn't find/update).`);
            res.status(404).json({ message: 'Product not found for update by findByIdAndUpdate.' });
        }
    } catch (error) {
        console.error(`[PUT /api/products/:_id] Error during update for _id '${productIdFromUrl}':`, error);
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ message: 'Invalid product ID format. Mongoose could not cast the _id.', errorName: error.name, errorDetails: error.message });
        }
        if (error.code === 11000) { // Duplicate key error, e.g. if trying to change numeric 'id' to an existing one
             return res.status(409).json({ message: 'Update conflicts with an existing unique ID (e.g. numeric id).', errorName: error.name, keyValue: error.keyValue });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation failed.', errorName: error.name, errors: error.errors });
        }
        // Catch-all for other errors during update
        res.status(500).json({ message: 'Server error updating product data.', errorName: error.name, errorDetails: error.message });
    }
});

// DELETE /api/products/:_id - Delete a product by its MongoDB _id
app.delete('/api/products/:_id', async (req, res) => {
    const productIdFromUrl = req.params._id;
    console.log(`[DELETE /api/products/:_id] Attempting to delete product with _id: '${productIdFromUrl}'`);
    console.log(`[DELETE /api/products/:_id] Type: ${typeof productIdFromUrl}, Length: ${productIdFromUrl ? productIdFromUrl.length : 'undefined'}`);

    try {
        const deletedProduct = await Product.findByIdAndDelete(productIdFromUrl);
        if (!deletedProduct) {
            console.log(`[DELETE /api/products/:_id] Product NOT FOUND for deletion with _id: '${productIdFromUrl}'`);
            return res.status(404).json({ message: 'Product not found for deletion.' });
        }
        console.log(`[DELETE /api/products/:_id] Product deleted successfully for _id: '${productIdFromUrl}'`);
        res.json({ message: 'Product deleted successfully.', product: deletedProduct });
    } catch (error) {
        console.error(`[DELETE /api/products/:_id] Error deleting product with _id '${productIdFromUrl}':`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID format.' });
        }
        res.status(500).json({ message: 'Error deleting product.' });
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

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
