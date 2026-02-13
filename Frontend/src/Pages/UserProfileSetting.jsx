import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Bell, Heart, Palette, Lock, Trash2, Camera,
    ChevronRight, LogOut, Shield, Zap, Image as ImageIcon,
    Settings, Sparkles, AlertTriangle, Check, X,
    Mail, Phone, MapPin, Calendar, Edit2, Plus, Share2
} from 'lucide-react';
import api from '../api/axios';

const UserProfileSetting = () => {
    const navigate = useNavigate();
    const { theme } = useOutletContext(); // Keeping context if needed for global theme
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Toggles State
    const [notifications, setNotifications] = useState({
        marketing: true,
        security: true,
        activity: true
    });
    const [privacy, setPrivacy] = useState({
        profileVisibility: true,
        galleryPrivacy: false,
        onlineStatus: true
    });

    // Gallery & Upload State
    const fileInputRef = useRef(null);
    const profilePicInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

    // Mock Data for new sections until backend is ready
    const [soulmate, setSoulmate] = useState(null);

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get('/user/profile');
                const userData = response.data.user;

                const processedPhotos = (userData.uploadedPhotos || []).filter(p => typeof p === 'object' && p !== null && p.url);

                setUser({
                    name: userData.name || 'User',
                    age: userData.age || 0,
                    location: 'San Francisco, CA', // Mock
                    verified: true,
                    matches: userData.matches || 0,
                    profilePicture: userData.profilePicture || (processedPhotos[0]?.url) || 'https://i.pravatar.cc/300?img=5',
                    photos: processedPhotos,
                    // Add other fields as needed
                });

                // Mock Soulmate Data (Simulating a match)
                if (userData.matches > 0) {
                    setSoulmate({
                        name: "Sarah Jenkins",
                        image: "https://i.pravatar.cc/300?img=9",
                        status: "Happily Paired"
                    });
                }

            } catch (error) {
                console.error('Error fetching profile:', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    // Handlers
    const handleToggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleTogglePrivacy = (key) => {
        setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleProfilePicChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingProfilePic(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/user/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(prev => ({ ...prev, profilePicture: response.data.url }));
        } catch (error) {
            console.error("Failed to update profile picture:", error);
            alert("Failed to update profile picture.");
        } finally {
            setUploadingProfilePic(false);
        }
    };

    const handleUploadPhoto = async (e) => {
        // Simplified upload for now, similar logic to previous implementation
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        // In a real implementation, we'd open a modal for caption/tags first.
        // For this redesign, we'll auto-upload to keep it simple or implement the modal later.
        // Re-using the FormData logic:
        const formData = new FormData();
        formData.append('image', file);
        formData.append('caption', '');
        formData.append('contextTags', JSON.stringify([]));

        try {
            const response = await api.post('/user/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(prev => ({
                ...prev,
                photos: [...prev.photos, response.data.photo]
            }));
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload photo.");
        } finally {
            setUploading(false);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    if (loading || !user) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-pink-50' : 'bg-burgundy'}`}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className={`min-h-screen w-full p-4 md:p-8 overflow-x-hidden pb-32 transition-colors duration-500
            ${theme === 'light' ? 'bg-pink-50 text-gray-800' : 'bg-burgundy text-white'}`}>
            <input type="file" ref={profilePicInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/*" />
            <input type="file" ref={fileInputRef} onChange={handleUploadPhoto} className="hidden" accept="image/*" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-5xl mx-auto space-y-8"
            >
                {/* --- HEADER --- */}
                <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-4 pt-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className={`relative w-32 h-32 rounded-full p-1 cursor-pointer ${theme === 'light' ? 'bg-white' : 'bg-burgundy'}`} onClick={() => profilePicInputRef.current?.click()}>
                            <img
                                src={user.profilePicture}
                                alt={user.name}
                                className={`w-full h-full rounded-full object-cover border-2 ${theme === 'light' ? 'border-gray-100' : 'border-white/10'}`}
                            />
                            {uploadingProfilePic && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 bg-pink-600 p-2 rounded-full border-2 border-burgundy text-white shadow-lg">
                                <Edit2 size={14} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h1 className={`text-4xl font-bold bg-clip-text text-transparent 
                            ${theme === 'light' ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600' : 'bg-gradient-to-r from-white via-pink-200 to-pink-500'}`}>
                            Account Settings
                        </h1>
                        <p className={`mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>Manage your profile and preferences</p>
                    </div>
                </motion.div>

                {/* --- SOULMATE CARD --- */}
                <motion.div variants={itemVariants} className={`rounded-3xl p-6 relative overflow-hidden group border backdrop-blur-xl
                    ${theme === 'light' ? 'bg-white/70 border-white/60 shadow-lg' : 'bg-glass-bg border-glass-border'}`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        {soulmate ? (
                            <>
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-pink-500/30 p-1">
                                        <img src={soulmate.image} alt={soulmate.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 text-2xl transition-transform hover:scale-125">💖</div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className={`text-2xl font-bold mb-1 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>My Soulmate</h2>
                                    <p className={`text-sm mb-2 italic ${theme === 'light' ? 'text-pink-600' : 'text-pink-200'}`}>You are happily paired with <span className={`font-semibold cursor-pointer hover:underline ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{soulmate.name}</span></p>
                                    <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                                        <button className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-sm font-semibold shadow-lg hover:shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 text-white">
                                            View Profile
                                        </button>
                                        <button className={`p-2 transition-colors text-xs flex items-center gap-1 ${theme === 'light' ? 'text-gray-500 hover:text-gray-800' : 'text-white/40 hover:text-white'}`}>
                                            <LogOut size={12} /> Unpair
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full py-6 text-center">
                                <Heart size={48} className={`mb-3 ${theme === 'light' ? 'text-pink-300' : 'text-white/20'}`} />
                                <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>No Soulmate Yet</h3>
                                <p className={`text-sm max-w-sm mb-4 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>You haven't matched with your special someone yet. Keep swiping!</p>
                                <button className={`px-6 py-2 border rounded-full text-sm transition-all ${theme === 'light' ? 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700' : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'}`}>
                                    Find Match
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Floating Hearts */}
                    <div className="absolute top-4 left-4 text-pink-500/20 animate-bounce delay-700"><Heart size={16} fill="currentColor" /></div>
                    <div className="absolute bottom-4 right-1/4 text-purple-500/20 animate-bounce delay-1000"><Heart size={20} fill="currentColor" /></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* --- NOTIFICATIONS SECTION --- */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className={`text-lg font-bold flex items-center gap-2 px-2 ${theme === 'light' ? 'text-gray-700' : 'text-white/80'}`}>
                            <Bell size={20} className="text-blue-400" /> Notifications
                        </h3>
                        <div className={`overflow-hidden rounded-3xl p-1 border backdrop-blur-xl ${theme === 'light' ? 'bg-white/70 border-white/60 shadow-md' : 'bg-glass-bg border-glass-border'}`}>
                            {[
                                { id: 'marketing', label: 'Marketing Emails', desc: 'Receive updates about new features', icon: <Zap size={18} className="text-yellow-400" /> },
                                { id: 'security', label: 'Security Alerts', desc: 'Get notified about login attempts', icon: <Shield size={18} className="text-green-400" /> },
                                { id: 'activity', label: 'Activity', desc: 'New likes and matches', icon: <Sparkles size={18} className="text-pink-400" /> },
                            ].map((item, i) => (
                                <div key={item.id} className={`flex items-center justify-between p-5 transition-colors ${i !== 2 ? (theme === 'light' ? 'border-b border-gray-100' : 'border-b border-white/5') : ''} ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-white/5'}`}>{item.icon}</div>
                                        <div>
                                            <div className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{item.label}</div>
                                            <div className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>{item.desc}</div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => handleToggleNotification(item.id)}
                                        className={`w-12 h-7 rounded-full flex items-center transition-colors cursor-pointer px-1 ${notifications[item.id] ? 'bg-gradient-to-r from-blue-500 to-purple-500' : (theme === 'light' ? 'bg-gray-200' : 'bg-white/10')}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${notifications[item.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* --- PRIVACY SECTION --- */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className={`text-lg font-bold flex items-center gap-2 px-2 ${theme === 'light' ? 'text-gray-700' : 'text-white/80'}`}>
                            <Lock size={20} className="text-purple-400" /> Privacy
                        </h3>
                        <div className={`overflow-hidden rounded-3xl p-1 border backdrop-blur-xl ${theme === 'light' ? 'bg-white/70 border-white/60 shadow-md' : 'bg-glass-bg border-glass-border'}`}>
                            {[
                                { id: 'profileVisibility', label: 'Public Profile', desc: 'Allow others to find you', icon: <User size={18} className="text-blue-300" /> },
                                { id: 'galleryPrivacy', label: 'Private Gallery', desc: 'Only matches can see your photos', icon: <ImageIcon size={18} className="text-purple-300" /> },
                                { id: 'onlineStatus', label: 'Online Status', desc: 'Show when you are active', icon: <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black ml-0.5" /> },
                            ].map((item, i) => (
                                <div key={item.id} className={`flex items-center justify-between p-5 transition-colors ${i !== 2 ? (theme === 'light' ? 'border-b border-gray-100' : 'border-b border-white/5') : ''} ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-white/5'}`}>{item.icon}</div>
                                        <div>
                                            <div className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{item.label}</div>
                                            <div className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>{item.desc}</div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => handleTogglePrivacy(item.id)}
                                        className={`w-12 h-7 rounded-full flex items-center transition-colors cursor-pointer px-1 ${privacy[item.id] ? 'bg-gradient-to-r from-pink-500 to-orange-500' : (theme === 'light' ? 'bg-gray-200' : 'bg-white/10')}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${privacy[item.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>

                {/* --- CARDS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* PREFERENCES */}
                    <motion.div variants={itemVariants} className={`rounded-3xl p-6 transition-all cursor-pointer group border backdrop-blur-xl
                        ${theme === 'light' ? 'bg-white/70 border-white/60 shadow-lg hover:bg-white/90' : 'bg-glass-bg border-glass-border hover:bg-white/5'}`}>
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-blue-100 text-blue-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                <Settings size={24} />
                            </div>
                            <div className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600' : 'bg-white/5 text-white/40 group-hover:bg-white/20 group-hover:text-white'}`}>
                                <ChevronRight size={16} />
                            </div>
                        </div>
                        <h4 className={`text-xl font-bold mb-1 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Preferences</h4>
                        <p className={`text-sm mb-4 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>Set your matching criteria</p>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`}>
                            <div className="w-3/5 h-full bg-blue-500 rounded-full" />
                        </div>
                        <div className="text-xs text-blue-300 mt-2 font-medium">3/5 criteria set</div>
                    </motion.div>

                    {/* GALLERY */}
                    <motion.div variants={itemVariants} className={`rounded-3xl p-6 transition-all cursor-pointer group relative overflow-hidden border backdrop-blur-xl
                        ${theme === 'light' ? 'bg-white/70 border-white/60 shadow-lg hover:bg-white/90' : 'bg-glass-bg border-glass-border hover:bg-white/5'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-purple-100 text-purple-500' : 'bg-purple-500/10 text-purple-400'}`}>
                                <ImageIcon size={24} />
                            </div>
                            <div className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600' : 'bg-white/5 text-white/40 group-hover:bg-white/20 group-hover:text-white'}`} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                <Plus size={16} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {user.photos.slice(0, 4).map((photo, i) => (
                                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-black/50">
                                    <img src={photo.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                            {[...Array(Math.max(0, 4 - user.photos.length))].map((_, i) => (
                                <div key={`empty-${i}`} className={`aspect-square rounded-lg border flex items-center justify-center ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                                    <Plus size={14} className={`${theme === 'light' ? 'text-gray-400' : 'text-white/20'}`} />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <h4 className={`font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Gallery</h4>
                            <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>{user.photos.length} photos</span>
                        </div>
                    </motion.div>

                    {/* DECORATIONS */}
                    <motion.div variants={itemVariants} className={`rounded-3xl p-6 transition-all cursor-pointer group border backdrop-blur-xl
                        ${theme === 'light' ? 'bg-white/70 border-white/60 shadow-lg hover:bg-white/90' : 'bg-glass-bg border-glass-border hover:bg-white/5'}`}>
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-pink-100 text-pink-500' : 'bg-pink-500/10 text-pink-400'}`}>
                                <Palette size={24} />
                            </div>
                            <div className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600' : 'bg-white/5 text-white/40 group-hover:bg-white/20 group-hover:text-white'}`}>
                                <ChevronRight size={16} />
                            </div>
                        </div>
                        <h4 className={`text-xl font-bold mb-1 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Theme</h4>
                        <p className={`text-sm mb-4 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>Customize your look</p>
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-black" />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 border-2 border-black" />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-black" />
                        </div>
                    </motion.div>

                </div>

                {/* --- DANGER ZONE --- */}
                <motion.div variants={itemVariants} className="pt-8">
                    <div className={`rounded-3xl p-8 backdrop-blur-sm border
                        ${theme === 'light' ? 'bg-red-50 border-red-100' : 'bg-red-500/5 border-red-500/20'}`}>
                        <h3 className="text-red-400 font-bold text-lg mb-6 flex items-center gap-2">
                            <AlertTriangle size={20} /> Danger Zone
                        </h3>

                        <div className="space-y-4">
                            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl transition-colors ${theme === 'light' ? 'hover:bg-red-100' : 'hover:bg-red-500/5'}`}>
                                <div>
                                    <h4 className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Delete Chat History</h4>
                                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>Permanently remove all your messages</p>
                                </div>
                                <button className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/10 transition-colors">
                                    Delete History
                                </button>
                            </div>
                            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl transition-colors ${theme === 'light' ? 'hover:bg-red-100' : 'hover:bg-red-500/5'}`}>
                                <div>
                                    <h4 className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Reset Account</h4>
                                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>Reset matches and preferences</p>
                                </div>
                                <button className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/10 transition-colors">
                                    Reset Account
                                </button>
                            </div>
                            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl transition-colors ${theme === 'light' ? 'hover:bg-red-100' : 'hover:bg-red-500/5'}`}>
                                <div>
                                    <h4 className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Delete Account</h4>
                                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>Permanently delete your account and data</p>
                                </div>
                                <button className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/20 transition-colors shadow-lg shadow-red-900/20">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="h-8"></div>
            </motion.div>
        </div>
    );
};

export default UserProfileSetting;
