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
    uploadedPhotos: [{
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        contextTags: [String],
        uploadedAt: { type: Date, default: Date.now }
    }],
    bio: String,
    inviteCode: { type: String, sparse: true }, // Sparse allows multiple null values
    pairedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pairToken: { type: String, unique: true, sparse: true },
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
