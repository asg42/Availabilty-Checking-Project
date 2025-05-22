const mongoose = require('mongoose');

const storeSchema = mongoose.Schema(
    {
        id: { type: Number, unique: true },
        name: { type: String, required: true },
        locations: [String],
        openTime: { type: String },
        closeTime: { type: String }
    },
    {
        timestamps: true,
        collection: 'storesInfo' // THIS IS CRUCIAL
    }
);

const Store = mongoose.model('Store', storeSchema); // No third arg here if 'collection' is in schema options
module.exports = Store;