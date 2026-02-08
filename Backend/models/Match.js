const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    photoId: String,
    user1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
