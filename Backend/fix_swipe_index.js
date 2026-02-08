const mongoose = require('mongoose');
require('dotenv').config();

async function dropSwipeIndex() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('swipes');

        // Drop the compound index on swiperId and swipeeId
        try {
            await collection.dropIndex('swiperId_1_swipeeId_1');
            console.log('✅ Successfully dropped swiperId_1_swipeeId_1 index');
        } catch (err) {
            console.log('Index might not exist:', err.message);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

dropSwipeIndex();
