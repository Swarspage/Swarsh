import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaBell, FaEnvelope, FaHeart, FaMoon, FaSun, FaLock,
    FaSignOutAlt, FaChevronRight, FaUser, FaShieldAlt
} from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import api from '../api/axios';
import { FaCopy } from 'react-icons/fa';

const AccountSetting = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useOutletContext(); // Use global theme context

    // Settings state
    const [settings, setSettings] = useState({
        notifications: {
            newMatches: true,
            messages: true,
            dateSuggestions: false
        }
    });

    // Partner/Invite State
    const [inviteToken, setInviteToken] = useState(null);
    const [partnerName, setPartnerName] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/user/profile');
                setUser(res.data.user);
                if (res.data.user.pairedWith) {
                    setPartnerName(res.data.user.pairedWith.name);
                } else {
                    // Generate token if not paired
                    generateInvite();
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchUser();
    }, []);

    const generateInvite = async () => {
        try {
            const res = await api.post('/invite/generate');
            setInviteToken(res.data.token);
        } catch (err) {
            console.error(err);
        }
    };

    const copyInvite = () => {
        const url = `${window.location.origin}/signup?token=${inviteToken}`;
        navigator.clipboard.writeText(url);
        alert('Invite link copied!');
    };

    // Toggle theme
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Toggle notification setting
    const toggleNotification = (key) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Still navigate even if API call fails
            navigate('/');
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

    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden flex flex-col pb-20 
            ${theme === 'light' ? 'bg-pink-50 text-gray-800' : 'bg-burgundy text-white'}`}>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex items-start justify-center px-4 pb-8 md:pt-8 overflow-y-auto">
                <motion.div
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-4xl mx-auto space-y-8 pt-20"
                >
                    {/* Title */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center
                                ${theme === 'light' ? 'bg-white shadow-md' : 'bg-burgundy border-2 border-white/10'}`}
                        >
                            <FaUser className="text-pink-500 text-3xl" />
                        </motion.div>
                        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            Account Settings
                        </h1>
                        <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            Manage your preferences and account details
                        </p>
                    </div>

                    {/* Invite / Partner Section */}
                    <div className="mb-8">
                        <motion.div
                            variants={itemVariants}
                            className={`rounded-2xl p-6 backdrop-blur-xl border relative overflow-hidden shadow-lg
                                ${theme === 'light' ? 'bg-white/70 border-white/60' : 'bg-glass-bg border-glass-border'}`}
                        >
                            <div className="relative z-10">
                                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme === 'light' ? 'text-pink-600' : 'text-white'}`}>
                                    <FaHeart className="animate-pulse text-pink-500" /> Relationship Status
                                </h2>

                                {partnerName ? (
                                    <div className={`flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl border
                                        ${theme === 'light' ? 'bg-pink-50 border-pink-100' : 'bg-white/5 border-white/5'}`}>
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl bg-cover" style={{ backgroundImage: 'url(https://i.pravatar.cc/150?img=5)' }}>
                                            </div>
                                        </div>
                                        <div className="text-center md:text-left flex-1">
                                            <p className={`text-sm mb-1 uppercase tracking-widest font-bold ${theme === 'light' ? 'text-pink-500' : 'text-pink-200'}`}>Happily Paired With</p>
                                            <h3 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{partnerName}</h3>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`text-center space-y-6 p-6 rounded-2xl border backdrop-blur-sm
                                        ${theme === 'light' ? 'bg-white/50 border-white/50' : 'bg-white/5 border-white/5'}`}>
                                        <p className={`text-lg mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-white'}`}>You are not paired yet 💔</p>
                                        <p className={`text-sm mb-6 max-w-md mx-auto ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                                            Send this invite link to your special someone to get started. Once they accept, it's just the two of you!
                                        </p>

                                        {inviteToken ? (
                                            <div className="flex gap-2 max-w-md mx-auto">
                                                <div className={`flex-1 p-4 rounded-xl font-mono tracking-wider text-center border
                                                    ${theme === 'light' ? 'bg-gray-100/50 text-gray-800 border-gray-200' : 'bg-black/40 text-pink-200 border-pink-500/20'}`}>
                                                    {inviteToken}
                                                </div>
                                                <button
                                                    onClick={copyInvite}
                                                    className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-6 rounded-xl font-bold shadow-lg hover:shadow-pink-500/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                                                >
                                                    <FaCopy /> Copy
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 animate-pulse">Generating invite code...</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Settings Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Notifications Section */}
                        <motion.div
                            variants={itemVariants}
                            className={`rounded-3xl p-6 shadow-lg border backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/70 border-white/60' : 'bg-glass-bg border-glass-border'}`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-blue-100 text-blue-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                    <FaBell size={20} />
                                </div>
                                <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                    Notifications
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {/* New Matches Toggle */}
                                <ToggleRow
                                    title="New Matches"
                                    description="Get notified when someone likes you back"
                                    checked={settings.notifications.newMatches}
                                    onChange={() => toggleNotification('newMatches')}
                                    icon={<FaHeart size={16} className="text-pink-400" />}
                                    theme={theme}
                                />

                                {/* Messages Toggle */}
                                <ToggleRow
                                    title="Messages"
                                    description="Receive alerts for new private messages"
                                    checked={settings.notifications.messages}
                                    onChange={() => toggleNotification('messages')}
                                    icon={<FaEnvelope size={16} className="text-blue-400" />}
                                    theme={theme}
                                />

                                {/* Date Suggestions Toggle */}
                                <ToggleRow
                                    title="Date Suggestions"
                                    description="Weekly romantic date ideas nearby"
                                    checked={settings.notifications.dateSuggestions}
                                    onChange={() => toggleNotification('dateSuggestions')}
                                    icon={<BsHeartFill size={16} className="text-yellow-400" />}
                                    theme={theme}
                                />
                            </div>
                        </motion.div>

                        {/* Appearance Section */}
                        <motion.div
                            variants={itemVariants}
                            className={`rounded-3xl p-6 shadow-lg border backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/70 border-white/60' : 'bg-glass-bg border-glass-border'}`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-purple-100 text-purple-600' : 'bg-purple-500/10 text-purple-400'}`}>
                                    <FaMoon size={20} />
                                </div>
                                <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                    Appearance
                                </h2>
                            </div>

                            {/* Dark Mode Toggle */}
                            <div className="space-y-1">
                                <ToggleRow
                                    icon={<FaMoon size={16} className="text-purple-400" />}
                                    title="Dark Mode"
                                    description={theme === 'dark' ? 'Optimized for night viewing' : 'Switch to a darker theme for night viewing'}
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                    theme={theme}
                                />
                            </div>
                        </motion.div>

                        {/* Account Section */}
                        <motion.div
                            variants={itemVariants}
                            className={`rounded-3xl p-6 shadow-lg border backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/70 border-white/60' : 'bg-glass-bg border-glass-border'}`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-green-100 text-green-600' : 'bg-green-500/10 text-green-400'}`}>
                                    <FaShieldAlt size={20} />
                                </div>
                                <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                    Account Security
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {/* Change Password */}
                                <SettingButton
                                    icon={FaLock}
                                    title="Change Password"
                                    onClick={() => alert('Change Password feature coming soon!')}
                                    theme={theme}
                                />

                                {/* Email Preferences */}
                                <SettingButton
                                    icon={FaEnvelope}
                                    title="Email Preferences"
                                    onClick={() => alert('Email Preferences feature coming soon!')}
                                    theme={theme}
                                />
                            </div>
                        </motion.div>

                        {/* Logout Button */}
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg border
                                ${theme === 'light' ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}
                        >
                            <FaSignOutAlt size={20} />
                            Log Out safely
                        </motion.button>

                        {/* Footer */}
                        <motion.div
                            variants={itemVariants}
                            className={`text-center py-4 text-sm ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`}
                        >
                            Swarsh v2.4.0 • Made with ❤️ in Paris
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Toggle Row Component
const ToggleRow = ({ icon, title, description, checked, onChange, theme }) => (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer group
        ${theme === 'light' ? 'hover:bg-black/5' : 'hover:bg-white/5'}`} onClick={onChange}>
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-white/5 group-hover:bg-white/10'}`}>{icon}</div>
            <div>
                <div className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{title}</div>
                <div className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>{description}</div>
            </div>
        </div>
        <div className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 ${checked ? 'bg-gradient-to-r from-pink-600 to-purple-600' : (theme === 'light' ? 'bg-gray-200' : 'bg-white/10')}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    </div>
);

// Setting Button Component
const SettingButton = ({ icon: Icon, title, onClick, theme }) => (
    <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-colors
            ${theme === 'light' ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
    >
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-white/70'}`}>
                <Icon size={18} />
            </div>
            <div>
                <div className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{title}</div>
            </div>
        </div>
        <FaChevronRight size={16} className={`${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`} />
    </motion.button>
);

export default AccountSetting;
