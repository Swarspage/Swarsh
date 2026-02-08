const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

// Models
const User = require('./models/User');
const Swipe = require('./models/Swipe');
const Match = require('./models/Match');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true }
});

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: false, // Allow frontend to access cookie
        secure: false, // Set to false for localhost (http)
        sameSite: 'lax' // Allow cross-site cookies
    }
}));

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'swarsh', allowed_formats: ['jpg', 'png', 'jpeg'] }
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// ========================
// AUTH ROUTES
// ========================

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password, name, age } = req.body;

        // Check if exists
        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) return res.status(400).json({ error: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            username, email, password: hashedPassword, name, age
        });
        await user.save();

        // Set session
        req.session.userId = user._id;

        res.json({ message: 'Signup successful', user: { id: user._id, username } });
    } catch (error) {
        console.error('Signup error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        req.session.userId = user._id;

        res.json({ message: 'Login successful', user: { id: user._id, username: user.username } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const user = await User.findById(req.session.userId).select('-password');
    res.json({ user });
});

// ========================
// USER ROUTES
// ========================

// Get profile
app.get('/api/user/profile', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const user = await User.findById(req.session.userId).select('-password');
    res.json({ user });
});

// Update profile
app.put('/api/user/profile', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const { name, age, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
        req.session.userId,
        { name, age, preferences },
        { new: true }
    ).select('-password');

    res.json({ user });
});

// Update settings
app.put('/api/user/settings', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const { settings } = req.body;

    const user = await User.findByIdAndUpdate(
        req.session.userId,
        { settings },
        { new: true }
    ).select('-password');

    res.json({ user });
});

// Upload photo
app.post('/api/user/upload-photo', upload.single('image'), async (req, res) => {
    try {
        console.log('==== PHOTO UPLOAD START ====');
        console.log('Session userId:', req.session.userId);
        console.log('Has file?:', !!req.file);

        if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        console.log('File details:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        const imageUrl = req.file.path;
        console.log('Cloudinary URL:', imageUrl);

        console.log('Updating user document...');
        const result = await User.findByIdAndUpdate(req.session.userId, {
            $push: { uploadedPhotos: imageUrl }
        });

        console.log('Update result:', !!result);
        console.log('==== PHOTO UPLOAD SUCCESS ====');

        res.json({ message: 'Photo uploaded', url: imageUrl });
    } catch (error) {
        console.error('Photo upload ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Update profile picture
app.post('/api/user/profile-picture', upload.single('image'), async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const imageUrl = req.file.path;

    await User.findByIdAndUpdate(req.session.userId, {
        profilePicture: imageUrl
    });

    res.json({ message: 'Profile picture updated', url: imageUrl });
});

// Delete photo
app.delete('/api/user/photo/:url', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const photoUrl = decodeURIComponent(req.params.url);

    await User.findByIdAndUpdate(req.session.userId, {
        $pull: { uploadedPhotos: photoUrl }
    });

    res.json({ message: 'Photo deleted' });
});

// ========================
// SWIPE ROUTES
// ========================

// Get next photo to swipe
app.get('/api/swipe/next', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    // Get ALL other users (exclude current user)
    const otherUsers = await User.find({ _id: { $ne: req.session.userId } });

    // Only get photos from OTHER users (not current user)
    const allPhotos = otherUsers.flatMap(user =>
        user.uploadedPhotos.map(url => ({
            url,
            ownerId: user._id,
            ownerName: user.name
        }))
    );

    console.log('Other users:', otherUsers.length);
    console.log('Total photos:', allPhotos.length);

    if (allPhotos.length === 0) {
        return res.status(404).json({ error: 'No photos available' });
    }

    // Random photo
    const randomPhoto = allPhotos[Math.floor(Math.random() * allPhotos.length)];

    res.json({ photo: randomPhoto, totalPhotos: allPhotos.length });
});


// Record swipe
app.post('/api/swipe', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const { photoId, direction, photoOwnerId } = req.body;

    // Save swipe (allow duplicate swipes for same photo)
    const swipe = new Swipe({
        userId: req.session.userId,
        photoId,
        direction
    });
    await swipe.save();

    // Check for match if right swipe
    if (direction === 'right') {
        const otherSwipe = await Swipe.findOne({
            userId: photoOwnerId,
            photoId,
            direction: 'right'
        });

        if (otherSwipe) {
            // Check if match already exists to prevent duplicates
            const existingMatch = await Match.findOne({
                $or: [
                    { user1Id: req.session.userId, user2Id: photoOwnerId },
                    { user1Id: photoOwnerId, user2Id: req.session.userId }
                ]
            });

            if (!existingMatch) {
                // Create match only if it doesn't exist
                const match = new Match({
                    photoId,
                    user1Id: req.session.userId,
                    user2Id: photoOwnerId
                });

                try {
                    await match.save();

                    // Send socket notification
                    io.to(photoOwnerId.toString()).emit('new_match', {
                        photoId,
                        message: 'You both loved this moment! 💕'
                    });

                    return res.json({ message: 'Match!', matched: true, photoId });
                } catch (err) {
                    console.error('Error creating match:', err);
                }
            } else {
                // Match already exists, don't show animation again
                return res.json({ message: 'Already matched', matched: false, alreadyMatched: true });
            }
        }
    }

    res.json({ message: 'Swipe recorded', matched: false });
});

// Get all matches
app.get('/api/match', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const matches = await Match.find({
        $or: [
            { user1Id: req.session.userId },
            { user2Id: req.session.userId }
        ]
    })
        .populate('user1Id', 'name profilePicture uploadedPhotos')
        .populate('user2Id', 'name profilePicture uploadedPhotos');

    res.json({ matches, currentUserId: req.session.userId });
});

// ========================
// MESSAGE ROUTES
// ========================

// Get conversation
app.get('/api/message/conversation/:otherUserId', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const { otherUserId } = req.params;

    const messages = await Message.find({
        $or: [
            { senderId: req.session.userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: req.session.userId }
        ]
    })
        .sort({ timestamp: 1 })
        .populate('senderId', 'name profilePicture')
        .populate('receiverId', 'name profilePicture');

    res.json({ messages });
});

// Send message
app.post('/api/message', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const { receiverId, content, imageUrl } = req.body;

    const message = new Message({
        senderId: req.session.userId,
        receiverId,
        content,
        imageUrl
    });

    await message.save();
    await message.populate('senderId', 'name profilePicture');

    // Send via socket
    io.to(receiverId).emit('new_message', message);

    res.json({ message });
});

// Mark as read
app.put('/api/message/read/:messageId', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    await Message.findByIdAndUpdate(req.params.messageId, { read: true });

    res.json({ message: 'Marked as read' });
});

// Get unread count
app.get('/api/message/unread-count', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const count = await Message.countDocuments({
        receiverId: req.session.userId,
        read: false
    });

    res.json({ count });
});

// ========================
// SOCKET.IO
// ========================

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async (userId) => {
        socket.join(userId);
        await User.findByIdAndUpdate(userId, { isOnline: true });
        socket.broadcast.emit('user_online', { userId });
    });

    socket.on('typing', (data) => {
        socket.to(data.receiverId).emit('user_typing', {
            userId: data.senderId,
            typing: true
        });
    });

    socket.on('stop_typing', (data) => {
        socket.to(data.receiverId).emit('user_typing', {
            userId: data.senderId,
            typing: false
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
