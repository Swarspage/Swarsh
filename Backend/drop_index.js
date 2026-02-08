const mongoose = require('mongoose');
require('dotenv').config();

async function dropInviteCodeIndex() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Drop the inviteCode_1 index
        await collection.dropIndex('inviteCode_1');
        console.log('✅ Successfully dropped inviteCode_1 index');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

dropInviteCodeIndex();
