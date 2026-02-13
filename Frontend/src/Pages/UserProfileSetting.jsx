import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaCamera, FaMapMarkerAlt, FaBell, FaCog, FaEdit, FaPlus, FaShare, FaCheckCircle, FaTimes, FaChevronLeft, FaChevronRight, FaTrash, FaTag, FaSave } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import api from '../api/axios';

const UserProfileSetting = () => {
    const navigate = useNavigate();
    const { theme } = useOutletContext();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    // Gallery State
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState(null); // { caption: '', contextTags: '' }
    const [isEditingDetails, setIsEditingDetails] = useState(false);

    // Interest Details
    const [showAddInterest, setShowAddInterest] = useState(false);
    const [newInterest, setNewInterest] = useState('');

    // Fetch user profile from backend
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get('/user/profile');
                const userData = response.data.user;

                // Transform backend data to match UI structure
                // Filter out legacy string photos to "start fresh"
                const processedPhotos = (userData.uploadedPhotos || []).filter(p => typeof p === 'object' && p !== null && p.url);

                setUser({
                    name: userData.name || 'User',
                    age: userData.age || 0,
                    location: 'San Francisco, CA', // TODO: Add location to backend
                    verified: true,
                    matches: 0,
                    likes: 0,
                    views: 0,
                    profileCompletion: calculateProfileCompletion(userData),
                    bio: userData.bio || "Looking for someone special! 💕",
                    interests: getInterestsFromPreferences(userData.preferences),
                    profilePicture: userData.profilePicture || (processedPhotos[0]?.url) || 'https://i.pravatar.cc/300?img=5',
                    photos: processedPhotos,
                    preferences: userData.preferences || {},
                    matchedMoments: [] // TODO: Fetch from matches
                });
            } catch (error) {
                console.error('Error fetching profile:', error);

                // If not logged in (401), redirect to login page
                if (error.response?.status === 401) {
                    navigate('/login');
                    return;
                }
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

    // --- Gallery Handlers ---

    const openGallery = (index) => {
        setSelectedPhotoIndex(index);
        setIsGalleryOpen(true);
        setIsEditingDetails(false);
        setEditingPhoto({
            caption: user.photos[index].caption || '',
            contextTags: (user.photos[index].contextTags || []).join(', ')
        });
    };

    const closeGallery = () => {
        setIsGalleryOpen(false);
        setSelectedPhotoIndex(null);
    };

    const nextPhoto = (e) => {
        e.stopPropagation();
        if (selectedPhotoIndex < user.photos.length - 1) {
            const newIndex = selectedPhotoIndex + 1;
            setSelectedPhotoIndex(newIndex);
            setEditingPhoto({
                caption: user.photos[newIndex].caption || '',
                contextTags: (user.photos[newIndex].contextTags || []).join(', ')
            });
            setIsEditingDetails(false);
        }
    };

    const prevPhoto = (e) => {
        e.stopPropagation();
        if (selectedPhotoIndex > 0) {
            const newIndex = selectedPhotoIndex - 1;
            setSelectedPhotoIndex(newIndex);
            setEditingPhoto({
                caption: user.photos[newIndex].caption || '',
                contextTags: (user.photos[newIndex].contextTags || []).join(', ')
            });
            setIsEditingDetails(false);
        }
    };

    const savePhotoDetails = async () => {
        const photo = user.photos[selectedPhotoIndex];
        // If it's a legacy string photo, we can't update it properly without an ID
        // But our backend now returns objects with _id.
        if (!photo._id) {
            alert("Cannot edit legacy photo. Please re-upload.");
            return;
        }

        try {
            const tags = editingPhoto.contextTags.split(',').map(t => t.trim()).filter(Boolean);

            await api.put(`/user/gallery/${photo._id}`, {
                caption: editingPhoto.caption,
                contextTags: tags
            });

            // Update local state
            const newPhotos = [...user.photos];
            newPhotos[selectedPhotoIndex] = {
                ...photo,
                caption: editingPhoto.caption,
                contextTags: tags
            };
            setUser({ ...user, photos: newPhotos });
            setIsEditingDetails(false);
        } catch (error) {
            console.error("Failed to save photo details:", error);
            alert("Failed to save changes.");
        }
    };

    const deletePhoto = async () => {
        if (!window.confirm("Are you sure you want to delete this photo?")) return;

        const photo = user.photos[selectedPhotoIndex];
        const photoId = photo._id; // Preferred

        try {
            if (photoId) {
                await api.delete(`/user/photo/${photoId}`);
            } else {
                // Fallback for legacy string URLs (though we prefer IDs now)
                // This might fail if the backend strictly expects IDs now, but let's try
                // or just block it.
                console.warn("Deleting legacy photo by URL is deprecated/risky.");
                // We updated backend to accept ID. If no ID, we might be stuck.
                // Assuming all new photos have IDs.
            }

            const newPhotos = user.photos.filter((_, i) => i !== selectedPhotoIndex);
            setUser({ ...user, photos: newPhotos });

            if (newPhotos.length === 0) {
                closeGallery();
            } else if (selectedPhotoIndex >= newPhotos.length) {
                setSelectedPhotoIndex(newPhotos.length - 1);
            } else {
                // Refresh editing state for the next photo that took this slot
                setEditingPhoto({
                    caption: newPhotos[selectedPhotoIndex].caption || '',
                    contextTags: (newPhotos[selectedPhotoIndex].contextTags || []).join(', ')
                });
            }
        } catch (error) {
            console.error("Failed to delete photo:", error);
            alert("Failed to delete photo.");
        }
    };

    // --- Upload Handlers ---
    const fileInputRef = React.useRef(null);
    const [uploading, setUploading] = useState(false);
    const [newPhoto, setNewPhoto] = useState(null); // { file: File, preview: string }
    const [newPhotoDetails, setNewPhotoDetails] = useState({ caption: '', contextTags: '' });

    const handleAddPhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setNewPhoto({ file, preview });
            setNewPhotoDetails({ caption: '', contextTags: '' });
        }
    };

    const cancelUpload = () => {
        if (newPhoto) {
            URL.revokeObjectURL(newPhoto.preview);
        }
        setNewPhoto(null);
        setNewPhotoDetails({ caption: '', contextTags: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUploadPhoto = async () => {
        if (!newPhoto) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('image', newPhoto.file);
        formData.append('caption', newPhotoDetails.caption);

        // Handle tags: clean and format
        const tags = newPhotoDetails.contextTags.split(',').map(t => t.trim()).filter(Boolean);
        formData.append('contextTags', JSON.stringify(tags)); // Backend expects stringified array or handles it

        try {
            const response = await api.post('/user/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const addedPhoto = response.data.photo;

            // Update local state with new photo
            // Ensure we handle object vs string if legacy still exists (but we filtered them)
            setUser(prev => ({
                ...prev,
                photos: [...prev.photos, addedPhoto]
            }));

            cancelUpload();
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload photo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden pb-20`}>
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            {/* Loading State */}
            {loading || !user ? (
                <div className="h-full flex items-center justify-center pt-40">
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
                    <div className="pt-24 pb-8 px-4 md:px-12 max-w-6xl mx-auto">

                        {/* Wrapper for Profile Header... (omitted for brevity, keep existing) */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`rounded-[32px] p-8 mb-8 backdrop-blur-xl border
                        ${theme === 'light' ? 'bg-white/60 border-white/50 shadow-xl shadow-pink-100/50' : 'bg-white/5 border-white/10 shadow-xl shadow-black/50'}`}
                        >
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                {/* Profile Picture */}
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink via-pink-2 to-burgundy-dark p-[3px]">
                                        <div className="w-full h-full rounded-full border-4 border-white overflow-hidden">
                                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute bottom-2 right-2 w-10 h-10 bg-pink rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white"
                                    >
                                        <FaCamera className="text-sm" />
                                    </motion.button>
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                        <h1 className={`text-4xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {user.name}, {user.age}
                                        </h1>
                                        {user.verified && <FaCheckCircle className="text-blue-500 text-xl" />}
                                    </div>
                                    <div className={`flex items-center justify-center md:justify-start gap-2 mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-500">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <span className="font-medium">{user.location}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex justify-center md:justify-start gap-4 mb-8">
                                        {[
                                            { label: 'Matches', value: user.matches },
                                            { label: 'Likes', value: user.likes },
                                            { label: 'Views', value: `${(user.views / 1000).toFixed(1)}k` }
                                        ].map((stat, i) => (
                                            <div key={i} className={`text-center px-6 py-4 rounded-2xl min-w-[100px] border
                                                ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-white/5 border-white/5'}`}>
                                                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
                                                <div className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{stat.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-4 justify-center md:justify-start">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowEditModal(true)}
                                            className="px-8 py-3 bg-gradient-to-r from-pink to-pink-2 text-white rounded-full font-bold flex items-center gap-2 shadow-lg hover:shadow-pink/25"
                                        >
                                            <FaEdit /> Edit Profile
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 border-2 transition-colors
                                        ${theme === 'light' ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-white/20 text-white hover:bg-white/10'}`}
                                        >
                                            <FaShare /> Share
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                            {/* Profile Completion */}
                            <div className="mt-10 pt-8 border-t border-dashed border-gray-200/20">
                                <div className="flex justify-between items-center mb-3">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Profile Completion
                                    </span>
                                    <span className="text-pink-2 font-bold">{user.profileCompletion}%</span>
                                </div>
                                <div className={`h-3 rounded-full overflow-hidden ${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'}`}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${user.profileCompletion}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-pink to-pink-2 rounded-full"
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
                                    className={`rounded-[32px] p-8 border backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/60 border-white/50 shadow-lg shadow-pink-100/30' : 'bg-white/5 border-white/10 shadow-lg shadow-black/30'}`}
                                >
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className={`text-xl font-bold flex items-center gap-3 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                            <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink"><BsHeartFill className="text-sm" /></span>
                                            Matched Moments
                                        </h2>
                                        <button className="text-pink-600 text-sm font-bold hover:underline">View All</button>
                                    </div>

                                    {user.matchedMoments.length > 0 ? (
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
                                    ) : (
                                        <div className={`text-center py-12 border-2 border-dashed rounded-2xl ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
                                            <p className={`${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>No moments shared yet. Match to create memories!</p>
                                        </div>
                                    )}
                                </motion.div>

                                {/* My Photos / Gallery */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className={`rounded-[32px] p-8 border backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/60 border-white/50 shadow-lg shadow-pink-100/30' : 'bg-white/5 border-white/10 shadow-lg shadow-black/30'}`}
                                >
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className={`text-xl font-bold flex items-center gap-3 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                            <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink"><FaCamera className="text-sm" /></span>
                                            My Gallery
                                        </h2>
                                        <span className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {user.photos.length}/6 Photos
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {/* Add Photo */}
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleAddPhotoClick}
                                            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                                        ${theme === 'light' ? 'border-pink-300 bg-pink-50/50 hover:bg-pink-50' : 'border-pink/30 bg-pink/5 hover:bg-pink/10'}`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink to-pink-2 flex items-center justify-center mb-2 shadow-lg">
                                                <FaPlus className="text-white" />
                                            </div>
                                            <span className={`text-xs font-bold ${theme === 'light' ? 'text-pink' : 'text-pink-2'}`}>
                                                Add Photo
                                            </span>
                                        </motion.div>

                                        {/* Existing Photos */}
                                        {user.photos.map((photo, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.05 }}
                                                onClick={() => openGallery(index)}
                                                className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-md bg-black"
                                                layoutId={`photo-${index}`}
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={`Gallery ${index}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                    {photo.caption && <p className="text-white text-xs font-medium truncate">{photo.caption}</p>}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Column (Interests & Bio) */}
                            <div className="space-y-8">
                                {/* My Interests */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`rounded-[32px] p-8 border backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/60 border-white/50 shadow-lg shadow-pink-100/30' : 'bg-white/5 border-white/10 shadow-lg shadow-black/30'}`}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className={`text-xl font-bold flex items-center gap-3 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                            <span className="text-2xl">⭐</span> My Interests
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
                                                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 group cursor-pointer border
                                            ${theme === 'light' ? 'bg-white border-pink-100 text-pink-700 shadow-sm' : 'bg-white/5 border-white/10 text-pink-300'}`}
                                            >
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
                                                className="flex gap-2 w-full mt-2"
                                            >
                                                <input
                                                    type="text"
                                                    value={newInterest}
                                                    onChange={(e) => setNewInterest(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                                                    placeholder="Add new interest..."
                                                    className={`flex-1 px-4 py-2 rounded-full text-sm outline-none border ${theme === 'light' ? 'bg-white border-pink-200' : 'bg-white/5 border-white/20 text-white'}`}
                                                    autoFocus
                                                />
                                                <button onClick={addInterest} className="px-4 py-2 bg-pink-500 text-white rounded-full font-bold text-sm">
                                                    Add
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Looking For / Bio */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className={`rounded-[32px] p-8 border backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/60 border-white/50 shadow-lg shadow-pink-100/30' : 'bg-white/5 border-white/10 shadow-lg shadow-black/30'}`}
                                >
                                    <h2 className={`text-xs font-bold mb-4 uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        About Me
                                    </h2>
                                    <p className={`leading-relaxed text-lg font-light italic ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                        "{user.bio}"
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Photo Modal */}
                    <AnimatePresence>
                        {newPhoto && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className={`relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border
                                        ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-white/10'}`}
                                >
                                    {/* Header */}
                                    <div className={`p-6 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/10'}`}>
                                        <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                            Add New Photo
                                        </h3>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-6">
                                        {/* Preview */}
                                        <div className="aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                                            <img src={newPhoto.preview} alt="Upload Preview" className="max-w-full max-h-full object-contain" />
                                        </div>

                                        {/* Inputs */}
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                Caption
                                            </label>
                                            <input
                                                type="text"
                                                value={newPhotoDetails.caption}
                                                onChange={(e) => setNewPhotoDetails({ ...newPhotoDetails, caption: e.target.value })}
                                                placeholder="Write a caption..."
                                                className={`w-full p-4 rounded-xl outline-none border transition-colors
                                                    ${theme === 'light' ? 'bg-gray-50 border-gray-200 focus:border-pink-300 text-gray-800' : 'bg-white/5 border-white/10 focus:border-pink-500/50 text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                Tags
                                            </label>
                                            <input
                                                type="text"
                                                value={newPhotoDetails.contextTags}
                                                onChange={(e) => setNewPhotoDetails({ ...newPhotoDetails, contextTags: e.target.value })}
                                                placeholder="e.g. Vacation, Summer (comma separated)"
                                                className={`w-full p-4 rounded-xl outline-none border transition-colors
                                                    ${theme === 'light' ? 'bg-gray-50 border-gray-200 focus:border-pink-300 text-gray-800' : 'bg-white/5 border-white/10 focus:border-pink-500/50 text-white'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className={`p-6 border-t flex gap-4 ${theme === 'light' ? 'border-gray-100 bg-gray-50' : 'border-white/10 bg-black/20'}`}>
                                        <button
                                            onClick={cancelUpload}
                                            disabled={uploading}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-colors
                                                ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-400 hover:bg-white/10'}`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUploadPhoto}
                                            disabled={uploading}
                                            className="flex-1 py-3 bg-gradient-to-r from-pink to-pink-2 text-white rounded-xl font-bold shadow-lg hover:shadow-pink/25 flex items-center justify-center gap-2"
                                        >
                                            {uploading ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                    />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPlus /> Add Photo
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Gallery Modal */}
                    <AnimatePresence>
                        {isGalleryOpen && selectedPhotoIndex !== null && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                                onClick={closeGallery}
                            >
                                <div
                                    className="relative w-full max-w-5xl h-[85vh] flex flex-col md:flex-row bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {/* Close Button */}
                                    <button
                                        onClick={closeGallery}
                                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
                                    >
                                        <FaTimes />
                                    </button>

                                    {/* Image Section */}
                                    <div className="flex-1 relative flex items-center justify-center bg-black/50">
                                        <motion.img
                                            key={selectedPhotoIndex}
                                            src={user.photos[selectedPhotoIndex].url}
                                            alt="Gallery"
                                            className="max-h-full max-w-full object-contain"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />

                                        {/* Navigation Arrows */}
                                        <button
                                            onClick={prevPhoto}
                                            disabled={selectedPhotoIndex === 0}
                                            className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            onClick={nextPhoto}
                                            disabled={selectedPhotoIndex === user.photos.length - 1}
                                            className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>

                                    {/* Details Sidebar */}
                                    <div className={`w-full md:w-80 border-l border-white/10 bg-gray-900 p-6 flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-gray-900'}`}>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Photo Details</h3>
                                                {!isEditingDetails ? (
                                                    <button
                                                        onClick={() => setIsEditingDetails(true)}
                                                        className="text-pink-500 text-sm font-semibold hover:text-pink-400"
                                                    >
                                                        Edit
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setIsEditingDetails(false)}
                                                        className="text-gray-400 text-sm hover:text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>

                                            {isEditingDetails ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-400 mb-1">CAPTION</label>
                                                        <textarea
                                                            value={editingPhoto.caption}
                                                            onChange={(e) => setEditingPhoto({ ...editingPhoto, caption: e.target.value })}
                                                            className={`w-full p-3 rounded-xl outline-none border focus:border-pink-500 transition-colors bg-transparent resize-none h-24
                                                                ${theme === 'light' ? 'border-gray-200 text-gray-800' : 'border-white/10 text-white'}`}
                                                            placeholder="Write a caption..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-400 mb-1">TAGS (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={editingPhoto.contextTags}
                                                            onChange={(e) => setEditingPhoto({ ...editingPhoto, contextTags: e.target.value })}
                                                            className={`w-full p-3 rounded-xl outline-none border focus:border-pink-500 transition-colors bg-transparent
                                                                ${theme === 'light' ? 'border-gray-200 text-gray-800' : 'border-white/10 text-white'}`}
                                                            placeholder="e.g. Vacation, Summer..."
                                                        />
                                                    </div>
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={savePhotoDetails}
                                                        className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold font-sm flex items-center justify-center gap-2"
                                                    >
                                                        <FaSave /> Save Changes
                                                    </motion.button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Caption</h4>
                                                        <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                                            {user.photos[selectedPhotoIndex].caption || <span className="italic text-gray-500">No caption added.</span>}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tags</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {user.photos[selectedPhotoIndex].contextTags && user.photos[selectedPhotoIndex].contextTags.length > 0 ? (
                                                                user.photos[selectedPhotoIndex].contextTags.map((tag, i) => (
                                                                    <span key={i} className="px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-xs font-medium border border-pink-500/20">
                                                                        #{tag}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="italic text-gray-500 text-sm">No tags.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-white/10">
                                            <button
                                                onClick={deletePhoto}
                                                className="w-full py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <FaTrash /> Delete Photo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

export default UserProfileSetting;
