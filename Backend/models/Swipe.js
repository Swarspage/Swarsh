const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    photoId: String,
    direction: String, // 'left' or 'right'
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Swipe', swipeSchema);
