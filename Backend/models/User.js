const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    name: String,
    age: Number,
    profilePicture: String,
    preferences: {
        food: String,
        song: String,
        movie: String
    },
    uploadedPhotos: [String],
    bio: String,
    inviteCode: { type: String, sparse: true }, // Sparse allows multiple null values
    settings: {
        notifications: {
            matches: { type: Boolean, default: true },
            messages: { type: Boolean, default: true }
        },
        theme: { type: String, default: 'light' }
    },
    isOnline: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
