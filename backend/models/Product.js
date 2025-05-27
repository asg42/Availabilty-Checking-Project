// backend/models/Product.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now },
    reviewerName: { type: String },
    reviewerEmail: { type: String }
}, { _id: true });


const productSchema = new mongoose.Schema(
    {
        id: { // Your numeric, application-level ID
            type: Number,
            required: true,
            unique: true,
            index: true
        },
        title: {
            type: String,
            required: [true, 'Product title is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        category: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative']
        },
        // discountPercentage field removed
        rating: {
            type: Number,
            min: 0,
            max: 5
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0
        },
        tags: [String],
        brand: {
            type: String,
            trim: true
        },
        sku: {
            type: String,
            trim: true,
        },
        weight: { type: Number },
        dimensions: {
            width: { type: Number },
            height: { type: Number },
            depth: { type: Number }
        },
        warrantyInformation: { type: String },
        shippingInformation: { type: String },
        availabilityStatus: { type: String },
        reviews: [reviewSchema],
        returnPolicy: { type: String },
        minimumOrderQuantity: {
            type: Number,
            min: 1,
            default: 1
        },
        meta: {
            barcode: { type: String },
            qrCode: { type: String }
        },
        images: [String],
        thumbnail: { type: String }
    },
    {
        timestamps: true,
        collection: 'productInfo'
    }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
