const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        id: { type: Number, unique: true },
        title: { type: String, required: true },
        description: { type: String },
        category: { type: String },
        price: { type: Number, required: true },
        discountPercentage: { type: Number },
        rating: { type: Number },
        stock: { type: Number, required: true },
        tags: [String],
        brand: { type: String },
        sku: { type: String },
        weight: { type: Number },
        dimensions: {
            width: { type: Number },
            height: { type: Number },
            depth: { type: Number }
        },
        warrantyInformation: { type: String },
        shippingInformation: { type: String },
        availabilityStatus: { type: String },
        reviews: [
            {
                rating: { type: Number },
                comment: { type: String },
                date: { type: String },
                reviewerName: { type: String },
                reviewerEmail: { type: String }
            }
        ],
        returnPolicy: { type: String },
        minimumOrderQuantity: { type: Number },
        meta: {
            createdAt: { type: String },
            updatedAt: { type: String },
            barcode: { type: String },
            qrCode: { type: String }
        },
        images: [String],
        thumbnail: { type: String }
    },
    {
        timestamps: true,
        collection: 'productInfo' // THIS IS CRUCIAL
    }
);

const Product = mongoose.model('Product', productSchema); // No third arg here if 'collection' is in schema options
module.exports = Product;