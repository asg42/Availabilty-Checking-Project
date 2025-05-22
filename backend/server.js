// 1. Load environment variables from .env file (MUST be at the very top)
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// 2. Import Mongoose
const mongoose = require('mongoose');
// mongoose.set('debug', true); // Removed: Disable Mongoose debugging for cleaner console

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

// 3. Define MongoDB Connection Function
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        // console.log(`MongoDB Connected: ${conn.connection.host}`); // Removed: No longer log connection info
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// 4. Call the database connection function
connectDB();

// 5. IMPORT Mongoose Models from their separate files
const Product = require('./models/Product');
const Store = require('./models/Store');


// 6. Update API Endpoints to use Mongoose Models

// GET all products (with optional search)
app.get('/api/products', async (req, res) => {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
    try {
        let products;
        if (searchTerm) {
            products = await Product.find({
                title: { $regex: searchTerm, $options: 'i' }
            });
        } else {
            products = await Product.find({});
        }
        // console.log("Products fetched from DB (raw):", products); // Removed: No longer log fetched products
        // console.log("Number of products fetched (raw):", products ? products.length : 0); // Removed: No longer log count
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error); // Keep error logs for debugging issues
        res.status(500).json({ message: 'Error fetching product data from database.' });
    }
});

// GET a specific product by ID
app.get('/api/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    try {
        const product = await Product.findOne({ id: productId });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found.' });
        }
    } catch (error) {
        console.error('Error fetching product by ID:', error); // Keep error logs
        res.status(500).json({ message: 'Error fetching product data.' });
    }
});

// PUT request to update a product's stock by ID
app.put('/api/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const { stock } = req.body;

    if (typeof stock === 'undefined' || stock === null) {
        return res.status(400).json({ message: 'Stock value is required for update.' });
    }

    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { id: productId },
            { stock: stock },
            { new: true }
        );

        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found for update.' });
        }
    } catch (error) {
        console.error('Error updating product stock:', error); // Keep error logs
        res.status(500).json({ message: 'Error updating product data.' });
    }
});

// GET all stores
app.get('/api/stores', async (req, res) => {
    try {
        const stores = await Store.find({});
        res.json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error); // Keep error logs
        res.status(500).json({ message: 'Error fetching store data.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});