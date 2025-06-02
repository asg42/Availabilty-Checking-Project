// backend/models/UserInfo.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    address: String,
    city: String,
    state: String,
    stateCode: String,
    postalCode: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    country: String
}, { _id: false }); // _id: false for subdocuments if not needed as separate IDs

const hairSchema = new mongoose.Schema({ color: String, type: String }, { _id: false });
const bankSchema = new mongoose.Schema({ cardExpire: String, cardNumber: String, cardType: String, currency: String, iban: String }, { _id: false });
const companySchema = new mongoose.Schema({ department: String, name: String, title: String, address: addressSchema }, { _id: false });
const cryptoSchema = new mongoose.Schema({ coin: String, wallet: String, network: String }, { _id: false });

const userInfoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true }, // The numeric ID from dummyjson
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    maidenName: String,
    age: Number,
    gender: String,
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // IMPORTANT: Store hashed passwords in a real app!
    birthDate: String,
    image: String,
    bloodGroup: String,
    height: Number,
    weight: Number,
    eyeColor: String,
    hair: hairSchema,
    ip: String,
    address: addressSchema,
    macAddress: String,
    university: String,
    bank: bankSchema,
    company: companySchema,
    ein: String,
    ssn: String,
    userAgent: String,
    crypto: cryptoSchema,
    role: { type: String, default: 'user' }, // You've set this to 'admin' in your data
    storeName: String // The field you added
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
    collection: 'usersInfo' // Explicitly set the collection name
});

const UserInfo = mongoose.model('UserInfo', userInfoSchema);

module.exports = UserInfo;
