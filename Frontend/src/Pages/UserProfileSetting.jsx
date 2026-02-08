import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaCamera, FaMapMarkerAlt, FaBell, FaCog, FaEdit, FaPlus, FaShare, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import api from '../api/axios';

const UserProfileSetting = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddInterest, setShowAddInterest] = useState(false);
    const [newInterest, setNewInterest] = useState('');

    // Theme sync
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Fetch user profile from backend
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get('/user/profile');
                const userData = response.data.user;

                // Transform backend data to match UI structure
                setUser({
                    name: userData.name || 'User',
                    age: userData.age || 0,
                    location: 'San Francisco, CA', // TODO: Add location to backend
                    verified: true,
                    matches: 0, // Real count - no matches yet
                    likes: 0, // Real count - no likes yet
                    views: 0, // Real count - no views yet
                    profileCompletion: calculateProfileCompletion(userData),
                    bio: userData.bio || "Looking for someone special! 💕",
                    interests: getInterestsFromPreferences(userData.preferences),
                    profilePicture: userData.profilePicture || (userData.uploadedPhotos?.[0]) || 'https://i.pravatar.cc/300?img=5',
                    photos: userData.uploadedPhotos || [],
                    preferences: userData.preferences || {},
                    matchedMoments: [] // TODO: Fetch from matches
                });
            } catch (error) {
                console.error('Error fetching profile:', error);

                // If not logged in (401), redirect to login page
                if (error.response?.status === 401) {
                    console.log('Not logged in, redirecting to login...');
                    navigate('/login');
                    return;
                }

                // Set default values on other errors
                setUser({
                    name: 'User',
                    age: 24,
                    location: 'Location not set',
                    verified: false,
                    matches: 0,
                    likes: 0,
                    views: 0,
                    profileCompletion: 20,
                    bio: "Complete your profile to get started!",
                    interests: [],
                    profilePicture: 'https://i.pravatar.cc/300?img=5',
                    photos: [],
                    preferences: {},
                    matchedMoments: []
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Helper function to calculate profile completion
    const calculateProfileCompletion = (userData) => {
        let completion = 0;
        if (userData.name) completion += 15;
        if (userData.age) completion += 10;
        if (userData.profilePicture) completion += 20;
        if (userData.uploadedPhotos?.length >= 3) completion += 30;
        if (userData.preferences?.food || userData.preferences?.song || userData.preferences?.movie) completion += 15;
        if (userData.bio) completion += 10;
        return Math.min(completion, 100);
    };

    // Helper function to get interests from preferences
    const getInterestsFromPreferences = (preferences) => {
        const interests = [];
        if (preferences?.food) interests.push(preferences.food);
        if (preferences?.song) interests.push('Music');
        if (preferences?.movie) interests.push('Movies');
        return interests;
    };

    const addInterest = () => {
        if (newInterest.trim() && !user.interests.includes(newInterest)) {
            setUser({ ...user, interests: [...user.interests, newInterest] });
            setNewInterest('');
            setShowAddInterest(false);
        }
    };

    const removeInterest = (interest) => {
        setUser({ ...user, interests: user.interests.filter(i => i !== interest) });
    };

    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden
            ${theme === 'light'
                ? 'bg-gradient-to-br from-pink-50 via-white to-pink-50'
                : 'bg-gradient-to-br from-[#1A0510] via-[#0A0005] to-[#1A0510]'}`}
        >
            {/* Loading State */}
            {loading || !user ? (
                <div className="min-h-screen flex items-center justify-center pt-20">
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"
                        />
                        <p className={`text-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            Loading profile...
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Main Content */}
                    <div className="pt-24 pb-24 px-4 md:px-12 max-w-6xl mx-auto">
                        {/* Profile Header Card */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`rounded-3xl p-8 mb-8 ${theme === 'light' ? 'bg-white/80' : 'bg-black/40'} backdrop-blur-xl
                        ${theme === 'light' ? 'shadow-xl shadow-pink-100' : 'shadow-xl shadow-black/50'}`}
                        >
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                {/* Profile Picture */}
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 p-1">
                                        <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <FaCamera className="text-white" />
                                    </motion.button>
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {user.name}, {user.age}
                                        </h1>
                                        {user.verified && <FaCheckCircle className="text-blue-500 text-xl" />}
                                    </div>
                                    <div className={`flex items-center justify-center md:justify-start gap-2 mb-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                        <FaMapMarkerAlt className="text-pink-500" />
                                        <span>{user.location}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex justify-center md:justify-start gap-8 mb-6">
                                        <div className={`text-center px-6 py-3 rounded-xl ${theme === 'light' ? 'bg-pink-50' : 'bg-white/5'}`}>
                                            <div className={`text-xs uppercase mb-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Matches</div>
                                            <div className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{user.matches}</div>
                                        </div>
                                        <div className={`text-center px-6 py-3 rounded-xl ${theme === 'light' ? 'bg-pink-50' : 'bg-white/5'}`}>
                                            <div className={`text-xs uppercase mb-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Likes</div>
                                            <div className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{user.likes}</div>
                                        </div>
                                        <div className={`text-center px-6 py-3 rounded-xl ${theme === 'light' ? 'bg-pink-50' : 'bg-white/5'}`}>
                                            <div className={`text-xs uppercase mb-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Views</div>
                                            <div className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{user.views / 1000}k</div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-4 justify-center md:justify-start">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowEditModal(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full font-bold flex items-center gap-2 shadow-lg"
                                        >
                                            <FaEdit /> Edit Profile
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 border-2
                                        ${theme === 'light' ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-white/20 text-white hover:bg-white/10'}`}
                                        >
                                            <FaShare />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Completion */}
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-semibold uppercase ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                        Profile Completion
                                    </span>
                                    <span className="text-pink-600 font-bold">{user.profileCompletion}%</span>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${user.profileCompletion}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-pink-500 to-pink-600"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Matched Moments */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`rounded-3xl p-6 ${theme === 'light' ? 'bg-white/80' : 'bg-black/40'} backdrop-blur-xl
                                ${theme === 'light' ? 'shadow-xl shadow-pink-100' : 'shadow-xl shadow-black/50'}`}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                            <BsHeartFill className="text-pink-500" /> Our Matched Moments
                                        </h2>
                                        <button className="text-pink-600 font-medium hover:underline">View All</button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {user.matchedMoments.map((moment) => (
                                            <motion.div
                                                key={moment.id}
                                                whileHover={{ scale: 1.05 }}
                                                className="relative rounded-2xl overflow-hidden aspect-square cursor-pointer group"
                                            >
                                                <img src={moment.image} alt={moment.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                                        <h3 className="font-bold">{moment.title}</h3>
                                                        <p className="text-sm text-gray-300">{moment.date}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* My Photos */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className={`rounded-3xl p-6 ${theme === 'light' ? 'bg-white/80' : 'bg-black/40'} backdrop-blur-xl
                                ${theme === 'light' ? 'shadow-xl shadow-pink-100' : 'shadow-xl shadow-black/50'}`}
                                >
                                    <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                        <FaCamera className="text-pink-500" /> My Photos
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {/* Add Photo */}
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`aspect-square rounded-2xl border-4 border-dashed flex flex-col items-center justify-center cursor-pointer
                                        ${theme === 'light' ? 'border-pink-300 bg-pink-50 hover:bg-pink-100' : 'border-pink-500/30 bg-pink-900/20 hover:bg-pink-900/30'}`}
                                        >
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-2">
                                                <FaPlus className="text-white text-2xl" />
                                            </div>
                                            <span className={`text-sm font-bold ${theme === 'light' ? 'text-pink-600' : 'text-pink-400'}`}>
                                                Add Photo
                                            </span>
                                        </motion.div>

                                        {/* Existing Photos */}
                                        {user.photos.map((photo, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.05 }}
                                                className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
                                            >
                                                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button className="p-2 bg-red-500 rounded-full text-white">
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                {/* My Interests */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`rounded-3xl p-6 ${theme === 'light' ? 'bg-white/80' : 'bg-black/40'} backdrop-blur-xl
                                ${theme === 'light' ? 'shadow-xl shadow-pink-100' : 'shadow-xl shadow-black/50'}`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                            ⭐ My Interests
                                        </h2>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setShowAddInterest(!showAddInterest)}
                                            className="text-pink-600 p-2 rounded-full hover:bg-pink-50"
                                        >
                                            <FaEdit />
                                        </motion.button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {user.interests.map((interest) => (
                                            <motion.span
                                                key={interest}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 group cursor-pointer
                                            ${theme === 'light' ? 'bg-pink-100 text-pink-700' : 'bg-pink-900/30 text-pink-400'}`}
                                            >
                                                {interest === 'Sushi' && '🍣'}
                                                {interest === 'Hiking' && '🥾'}
                                                {interest === 'Indie Pop' && '🎵'}
                                                {interest === 'Horror Movies' && '👻'}
                                                {interest === 'Coffee' && '☕'}
                                                {interest}
                                                <FaTimes
                                                    onClick={() => removeInterest(interest)}
                                                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                />
                                            </motion.span>
                                        ))}
                                        {showAddInterest && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="flex gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    value={newInterest}
                                                    onChange={(e) => setNewInterest(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                                                    placeholder="New interest..."
                                                    className={`px-4 py-2 rounded-full text-sm outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5 text-white'}`}
                                                />
                                                <button onClick={addInterest} className="text-pink-600">
                                                    <FaPlus />
                                                </button>
                                            </motion.div>
                                        )}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowAddInterest(true)}
                                            className={`px-4 py-2 rounded-full border-2 border-dashed font-medium
                                        ${theme === 'light' ? 'border-pink-300 text-pink-600 hover:bg-pink-50' : 'border-pink-500/30 text-pink-400 hover:bg-pink-900/20'}`}
                                        >
                                            + Add
                                        </motion.button>
                                    </div>
                                </motion.div>

                                {/* Looking For */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className={`rounded-3xl p-6 ${theme === 'light' ? 'bg-white/80' : 'bg-black/40'} backdrop-blur-xl
                                ${theme === 'light' ? 'shadow-xl shadow-pink-100' : 'shadow-xl shadow-black/50'}`}
                                >
                                    <h2 className={`text-xl font-bold mb-4 uppercase text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                        Looking For
                                    </h2>
                                    <p className={`leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                        {user.bio}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Navigation */}
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className={`fixed bottom-0 left-0 right-0 z-50 px-8 py-4 ${theme === 'light'
                            ? 'bg-white/80 border-t border-gray-200'
                            : 'bg-black/60 border-t border-white/10'} backdrop-blur-xl`}
                    >
                        <div className="max-w-md mx-auto flex justify-around items-center">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate('/explore')}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className={`p-3 rounded-full ${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'}`}>
                                    <FaHeart className={`text-xl ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                                <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>EXPLORE</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate('/soulmate')}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className={`p-3 rounded-full ${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'}`}>
                                    <BsHeartFill className={`text-xl ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                                <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>SOULMATE</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-pink-600">
                                    <FaCamera className="text-white text-xl" />
                                </div>
                                <span className="text-xs font-bold text-pink-600">PROFILE</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate('/settings')}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className={`p-3 rounded-full ${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'}`}>
                                    <FaBell className={`text-xl ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                                <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>SETTINGS</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default UserProfileSetting;
