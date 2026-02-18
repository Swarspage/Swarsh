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
        const { username, email, password, name, age, inviteToken } = req.body;

        // Check if exists
        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) return res.status(400).json({ error: 'User already exists' });

        // First user check (to bootstrap the system)
        const userCount = await User.countDocuments();
        let pairedWithId = null;

        if (userCount > 0) {
            // If not the first user, require invite token
            if (!inviteToken) {
                return res.status(400).json({ error: 'Invite token required for registration' });
            }

            // Find inviter
            const inviter = await User.findOne({ pairToken: inviteToken });
            if (!inviter) {
                return res.status(400).json({ error: 'Invalid invite token' });
            }

            if (inviter.pairedWith) {
                return res.status(400).json({ error: 'Inviter is already paired' });
            }

            pairedWithId = inviter._id;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            name,
            age,
            pairedWith: pairedWithId
        });
        await user.save();

        // If paired, update inviter
        if (pairedWithId) {
            await User.findByIdAndUpdate(pairedWithId, {
                pairedWith: user._id,
                $unset: { pairToken: "" } // Clear token after use
            });
        }

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

// ========================
// INVITE ROUTES
// ========================

// Generate Invite Token
app.post('/api/invite/generate', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    try {
        const user = await User.findById(req.session.userId);
        if (user.pairedWith) {
            return res.status(400).json({ error: 'You are already paired!' });
        }

        // Generate or return existing token
        let token = user.pairToken;
        if (!token) {
            // Simple random token
            token = require('crypto').randomBytes(4).toString('hex').toUpperCase();
            user.pairToken = token;
            await user.save();
        }

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Validate Invite Token
app.get('/api/invite/validate/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const inviter = await User.findOne({ pairToken: token }).select('name profilePicture');

        if (!inviter) {
            return res.status(404).json({ valid: false, error: 'Invalid invite code' });
        }

        res.json({ valid: true, inviter });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

    const user = await User.findById(req.session.userId).select('-password').populate('pairedWith', 'name profilePicture');
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
        if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imageUrl = req.file.path;
        console.log('Cloudinary URL:', imageUrl);

        // Get caption and tags from body
        const { caption, contextTags } = req.body;
        let tags = [];
        if (contextTags) {
            try {
                // If it's a stringified array (from FormData), parse it
                tags = JSON.parse(contextTags);
            } catch (e) {
                // If it's just a string, wrap it
                tags = [contextTags];
            }
        }

        const newPhoto = {
            url: imageUrl,
            caption: caption || '',
            contextTags: tags,
            uploadedAt: new Date()
        };

        console.log('Updating user document with new photo object...');
        const result = await User.findByIdAndUpdate(req.session.userId, {
            $push: { uploadedPhotos: newPhoto }
        }, { new: true }); // Return updated doc

        const addedPhoto = result.uploadedPhotos[result.uploadedPhotos.length - 1];

        res.json({ message: 'Photo uploaded', photo: addedPhoto });
    } catch (error) {
        console.error('Photo upload ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Update profile picture
app.post('/api/user/profile-picture', upload.single('image'), async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imageUrl = req.file.path;
        console.log('Profile picture uploaded to Cloudinary:', imageUrl);

        await User.findByIdAndUpdate(req.session.userId, {
            profilePicture: imageUrl
        });

        res.json({ message: 'Profile picture updated', url: imageUrl });
    } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Delete photo
app.delete('/api/user/photo/:photoId', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const photoId = req.params.photoId;

    await User.findByIdAndUpdate(req.session.userId, {
        $pull: { uploadedPhotos: { _id: photoId } }
    });

    res.json({ message: 'Photo deleted' });
});

// Update gallery photo details
app.put('/api/user/gallery/:photoId', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    const { photoId } = req.params;
    const { caption, contextTags } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { _id: req.session.userId, "uploadedPhotos._id": photoId },
            {
                $set: {
                    "uploadedPhotos.$.caption": caption,
                    "uploadedPhotos.$.contextTags": contextTags
                }
            },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'Photo not found' });

        res.json({ message: 'Photo updated', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
        user.uploadedPhotos.map(photo => {
            // Check if photo is object or string (legacy)
            const url = typeof photo === 'string' ? photo : photo.url;
            const caption = typeof photo === 'string' ? '' : photo.caption;
            const contextTags = typeof photo === 'string' ? [] : photo.contextTags;
            const photoId = typeof photo === 'string' ? null : photo._id;

            return {
                url,
                caption,
                contextTags,
                photoId,
                ownerId: user._id,
                ownerName: user.name
            };
        })
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

// Get specific user's photo (for Couple Mode)
app.get('/api/users/:userId/photo', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Collect all available photos
        let photos = [];
        if (user.uploadedPhotos && user.uploadedPhotos.length > 0) {
            photos = user.uploadedPhotos.map(p => {
                if (typeof p === 'string') return { url: p };
                return p;
            });
        }
        if (user.profilePicture) {
            photos.push({ url: user.profilePicture, isProfilePic: true });
        }

        if (photos.length === 0) {
            return res.status(404).json({ error: 'No photos available' });
        }

        // Pick a random one for "infinite" feel
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];

        // Return in the format expected by frontend
        const photoData = {
            url: randomPhoto.url,
            caption: randomPhoto.caption || '',
            contextTags: randomPhoto.contextTags || [],
            photoId: randomPhoto._id || 'profile',
            ownerId: user._id,
            ownerName: user.name
        };

        res.json({ photo: photoData, totalPhotos: photos.length });

    } catch (error) {
        console.error('Error fetching partner photo:', error);
        res.status(500).json({ error: error.message });
    }
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

    try {
        // 1. Get real matches from DB
        let matches = await Match.find({
            $or: [
                { user1Id: req.session.userId },
                { user2Id: req.session.userId }
            ]
        })
            .populate('user1Id', 'name profilePicture uploadedPhotos')
            .populate('user2Id', 'name profilePicture uploadedPhotos');

        // 2. Check for "Paired" partner
        const currentUser = await User.findById(req.session.userId)
            .populate('pairedWith', 'name profilePicture uploadedPhotos');

        if (currentUser && currentUser.pairedWith) {
            const partner = currentUser.pairedWith;

            // Check if partner is already in matches
            const isPartnerMatched = matches.some(m =>
                (m.user1Id._id.toString() === partner._id.toString()) ||
                (m.user2Id._id.toString() === partner._id.toString())
            );

            if (!isPartnerMatched) {
                // Create a "virtual" match object for the response
                // Structure must match what frontend expects from population
                // The frontend expects user1Id and user2Id to be the user objects
                const virtualMatch = {
                    _id: 'paired_' + partner._id, // unique ID
                    user1Id: currentUser, // fully populated user object (with pairedWith, but that's fine)
                    user2Id: partner,      // fully populated user object
                    isVirtual: true,
                    timestamp: new Date()
                };

                // Add to matches
                matches.unshift(virtualMatch);
            }
        }

        res.json({ matches, currentUserId: req.session.userId });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: error.message });
    }
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
