/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Bell, Heart, Palette, Lock, Trash2, Camera,
    ChevronRight, LogOut, Shield, Zap, Image as ImageIcon,
    Settings, Sparkles, AlertTriangle, Check, X,
    Edit2, Plus
} from 'lucide-react';
import api from '../api/axios';

const UserProfileSetting = () => {
    const navigate = useNavigate();
    const { theme } = useOutletContext();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const fileInputRef = useRef(null);
    const profilePicInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
    const [soulmate, setSoulmate] = useState(null);

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
                    location: 'Location',
                    verified: true,
                    matches: userData.matches || 0,
                    profilePicture: userData.profilePicture || (processedPhotos[0]?.url) || 'https://i.pravatar.cc/300?img=5',
                    photos: processedPhotos,
                });

                if (userData.matches > 0) {
                    setSoulmate({
                        name: "Sarah", // Mock
                        image: "https://i.pravatar.cc/300?img=9",
                        status: "Paired"
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
        } finally {
            setUploadingProfilePic(false);
        }
    };

    const handleUploadPhoto = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('image', file);

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
        } finally {
            setUploading(false);
        }
    };

    // Theme Constants
    const isLight = theme === 'light';
    const pageBg = isLight
        ? 'bg-gradient-to-b from-[#FFFFFF] to-[#A8A7ED]'
        : 'bg-gradient-to-b from-[#09090F] to-[#12101F]';

    const textPrimary = isLight ? 'text-[#000407]' : 'text-[#F0EFFF]';
    const textSecondary = isLight ? 'text-[#000407] opacity-60' : 'text-[#F0EFFF] opacity-50';
    const accentColor = '#A8A7ED';

    const glassStyle = {
        background: isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(168, 167, 237, 0.05)',
        backdropFilter: 'blur(16px)',
        border: isLight ? '1px solid rgba(168, 167, 237, 0.2)' : '1px solid rgba(168, 167, 237, 0.1)',
        boxShadow: isLight ? '0 4px 20px rgba(168, 167, 237, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.2)',
    };

    // Clean Toggle Switch Component
    const ToggleSwitch = ({ checked, onChange }) => (
        <div
            onClick={onChange}
            className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 relative
            ${checked ? 'bg-[#A8A7ED]' : (isLight ? 'bg-gray-200' : 'bg-white/10')}`}
        >
            <div
                className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300
                ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </div>
    );

    if (loading || !user) return <div className={`min-h-screen ${pageBg}`} />;

    return (
        <div className={`min-h-screen w-full relative overflow-hidden transition-colors duration-500 font-sans ${pageBg}`}>
            <input type="file" ref={profilePicInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/*" />
            <input type="file" ref={fileInputRef} onChange={handleUploadPhoto} className="hidden" accept="image/*" />

            <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-10 space-y-8">

                {/* --- HEADER --- */}
                <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => profilePicInputRef.current?.click()}
                    >
                        <div className={`w-32 h-32 rounded-full p-1 border-2 transition-all
                            ${isLight ? 'border-[#A8A7ED] bg-white' : 'border-[#A8A7ED]/50 bg-white/5'}`}>
                            <img
                                src={user.profilePicture}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-[#A8A7ED] p-2 rounded-full text-white shadow-md">
                            <Edit2 size={12} />
                        </div>
                    </div>

                    <div>
                        <h1 className={`text-3xl font-bold ${textPrimary}`}>
                            {user.name}
                        </h1>
                        <p className={`text-sm font-medium ${textSecondary}`}>
                            {user.age} years old
                        </p>
                    </div>
                </div>

                {/* --- SOULMATE CARD --- */}
                <div className="rounded-[32px] p-8 overflow-hidden relative" style={glassStyle}>
                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        {soulmate ? (
                            <>
                                <div className="w-20 h-20 rounded-full border-2 border-[#A8A7ED] p-0.5">
                                    <img src={soulmate.image} className="w-full h-full rounded-full object-cover" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className={`text-xl font-bold ${textPrimary}`}>
                                        Paired with {soulmate.name}
                                    </h2>
                                    <p className={`text-sm ${textSecondary}`}>
                                        Your soulmate
                                    </p>
                                </div>
                                <button className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all
                                    ${isLight ? 'border-[#A8A7ED] text-[#A8A7ED] hover:bg-[#A8A7ED] hover:text-white' : 'border-[#A8A7ED] text-[#A8A7ED] hover:bg-[#A8A7ED] hover:text-white'}`}>
                                    View Profile
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full py-4 text-center space-y-3">
                                <Heart size={32} className="text-[#A8A7ED] opacity-60" />
                                <div>
                                    <h3 className={`text-lg font-bold ${textPrimary}`}>No Match Yet</h3>
                                    <p className={`text-sm ${textSecondary}`}>Start exploring to find your person.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/explore')}
                                    className="px-6 py-2 bg-[#A8A7ED] text-white rounded-full text-sm font-bold shadow-lg hover:shadow-[#A8A7ED]/30"
                                >
                                    Find Match
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* --- NOTIFICATIONS --- */}
                    <div className="rounded-[32px] p-6" style={glassStyle}>
                        <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
                            <Bell size={18} className="text-[#A8A7ED]" /> Notifications
                        </h3>
                        <div className="space-y-6">
                            {[
                                { id: 'marketing', label: 'Marketing Emails', desc: 'Updates & Features' },
                                { id: 'activity', label: 'Activity', desc: 'Likes & Matches' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div>
                                        <div className={`text-sm font-semibold ${textPrimary}`}>{item.label}</div>
                                        <div className={`text-xs ${textSecondary}`}>{item.desc}</div>
                                    </div>
                                    <ToggleSwitch
                                        checked={notifications[item.id]}
                                        onChange={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- PRIVACY --- */}
                    <div className="rounded-[32px] p-6" style={glassStyle}>
                        <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
                            <Lock size={18} className="text-[#A8A7ED]" /> Privacy
                        </h3>
                        <div className="space-y-6">
                            {[
                                { id: 'profileVisibility', label: 'Public Profile', desc: 'Visible to everyone' },
                                { id: 'onlineStatus', label: 'Online Status', desc: 'Show when active' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div>
                                        <div className={`text-sm font-semibold ${textPrimary}`}>{item.label}</div>
                                        <div className={`text-xs ${textSecondary}`}>{item.desc}</div>
                                    </div>
                                    <ToggleSwitch
                                        checked={privacy[item.id]}
                                        onChange={() => setPrivacy(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* PREFERENCES */}
                    <div className="rounded-[32px] p-6 relative overflow-hidden" style={glassStyle}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-2 rounded-xl ${isLight ? 'bg-[#A8A7ED]/10 text-[#A8A7ED]' : 'bg-[#A8A7ED]/20 text-[#A8A7ED]'}`}>
                                <Settings size={20} />
                            </div>
                        </div>
                        <h4 className={`text-lg font-bold mb-1 ${textPrimary}`}>Preferences</h4>
                        <p className={`text-xs mb-4 ${textSecondary}`}>Matching criteria</p>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-[#A8A7ED]/20' : 'bg-white/10'}`}>
                            <div className="w-3/5 h-full bg-[#A8A7ED] rounded-full" />
                        </div>
                    </div>

                    {/* GALLERY */}
                    <div className="rounded-[32px] p-6 relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" style={glassStyle}
                        onClick={() => fileInputRef.current?.click()}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-xl ${isLight ? 'bg-[#A8A7ED]/10 text-[#A8A7ED]' : 'bg-[#A8A7ED]/20 text-[#A8A7ED]'}`}>
                                <ImageIcon size={20} />
                            </div>
                            <Plus size={16} className={textSecondary} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {user.photos.slice(0, 2).map((photo, i) => (
                                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-black/10">
                                    <img src={photo.url} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <h4 className={`font-bold text-sm ${textPrimary}`}>Gallery</h4>
                            <span className={`text-xs ${textSecondary}`}>{user.photos.length} photos</span>
                        </div>
                    </div>

                    {/* THEME */}
                    <div className="rounded-[32px] p-6 relative overflow-hidden" style={glassStyle}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-2 rounded-xl ${isLight ? 'bg-[#A8A7ED]/10 text-[#A8A7ED]' : 'bg-[#A8A7ED]/20 text-[#A8A7ED]'}`}>
                                <Palette size={20} />
                            </div>
                        </div>
                        <h4 className={`text-lg font-bold mb-1 ${textPrimary}`}>Theme</h4>
                        <p className={`text-xs mb-4 ${textSecondary}`}>Current: Lavender</p>
                        <div className="w-6 h-6 rounded-full bg-[#A8A7ED] border-2 border-white shadow-sm" />
                    </div>
                </div>

                {/* --- DANGER ZONE --- */}
                <div className={`rounded-[32px] p-6 border ${isLight ? 'border-red-100 bg-red-50/50' : 'border-red-500/20 bg-red-500/5'}`}>
                    <h3 className="text-red-400 font-bold text-sm mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} /> Danger Zone
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 border border-red-200 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                            Delete History
                        </button>
                        <button className="px-4 py-2 border border-red-200 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                            Delete Account
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserProfileSetting;
