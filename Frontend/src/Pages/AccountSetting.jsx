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

    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden flex flex-col pb-20`}>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex items-start justify-center px-4 pb-8 md:pt-8 overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl pt-20"
                >
                    {/* Title */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center
                                ${theme === 'light' ? 'bg-pink-100' : 'bg-burgundy'}`}
                        >
                            <FaUser className="text-pink text-3xl" />
                        </motion.div>
                        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
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
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`rounded-2xl p-6 backdrop-blur-xl border relative overflow-hidden
                                ${theme === 'light' ? 'bg-gradient-to-br from-pink-50 to-white border-pink-100' : 'bg-gradient-to-br from-burgundy to-black border-white/10'}`}
                        >
                            <div className="relative z-10">
                                <h2 className={`text-xl font-bold mb-2 flex items-center gap-2 ${theme === 'light' ? 'text-burgundy' : 'text-pink'}`}>
                                    <FaHeart className="animate-pulse" /> My Soulmate
                                </h2>

                                {partnerName ? (
                                    <div className="text-center py-4">
                                        <p className={`text-lg mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                            You are happily paired with
                                        </p>
                                        <h3 className="text-3xl font-serif font-bold text-pink-vibrant">
                                            {partnerName}
                                        </h3>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                            You are not paired yet. Send this invite link to your special someone to get started.
                                            Once they accept, it's just the two of you! 💕
                                        </p>

                                        {inviteToken ? (
                                            <div className="flex gap-2">
                                                <div className={`flex-1 p-3 rounded-xl font-mono text-center tracking-widest border border-dashed
                                                    ${theme === 'light' ? 'bg-white border-pink-200 text-burgundy' : 'bg-black/30 border-pink/30 text-white'}`}>
                                                    {inviteToken}
                                                </div>
                                                <button
                                                    onClick={copyInvite}
                                                    className="bg-pink text-white px-6 rounded-xl font-bold shadow-lg hover:shadow-pink/30 transition-all flex items-center gap-2"
                                                >
                                                    <FaCopy /> Copy Link
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center text-sm text-gray-500">Loading invite...</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Settings Container */}
                    <div className="space-y-6">
                        {/* Notifications Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`rounded-2xl p-6 backdrop-blur-xl border
                                ${theme === 'light' ? 'bg-white/80 border-white/50' : 'bg-black/40 border-white/10'}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <FaBell className="text-pink text-xl" />
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
                                    theme={theme}
                                />

                                {/* Messages Toggle */}
                                <ToggleRow
                                    title="Messages"
                                    description="Receive alerts for new private messages"
                                    checked={settings.notifications.messages}
                                    onChange={() => toggleNotification('messages')}
                                    theme={theme}
                                />

                                {/* Date Suggestions Toggle */}
                                <ToggleRow
                                    title="Date Suggestions"
                                    description="Weekly romantic date ideas nearby"
                                    checked={settings.notifications.dateSuggestions}
                                    onChange={() => toggleNotification('dateSuggestions')}
                                    theme={theme}
                                />
                            </div>
                        </motion.div>

                        {/* Appearance Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className={`rounded-2xl p-6 backdrop-blur-xl border
                                ${theme === 'light' ? 'bg-white/80 border-white/50' : 'bg-black/40 border-white/10'}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <BsHeartFill className="text-pink text-xl" />
                                <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                    Appearance
                                </h2>
                            </div>

                            {/* Dark Mode Toggle */}
                            <ToggleRow
                                icon={theme === 'dark' ? FaMoon : FaSun}
                                title="Dark Mode"
                                description={theme === 'dark' ? 'Currently optimized for night viewing' : 'Switch to a darker theme for night viewing'}
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                                theme={theme}
                            />
                        </motion.div>

                        {/* Account Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className={`rounded-2xl p-6 backdrop-blur-xl border
                                ${theme === 'light' ? 'bg-white/80 border-white/50' : 'bg-black/40 border-white/10'}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <FaShieldAlt className="text-pink text-xl" />
                                <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                    Account
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
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className={`w-full rounded-2xl p-4 backdrop-blur-xl flex items-center justify-center gap-3
                                ${theme === 'light'
                                    ? 'bg-red-50 hover:bg-red-100 text-red-600'
                                    : 'bg-red-900/20 hover:bg-red-900/30 text-red-400'} 
                                transition-all`}
                        >
                            <FaSignOutAlt className="text-xl" />
                            <span className="font-bold">Log Out</span>
                        </motion.button>

                        {/* Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className={`text-center py-4 text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}
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
const ToggleRow = ({ icon: Icon, title, description, checked, onChange, theme }) => (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-all
        ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}>
        <div className="flex items-start gap-3 flex-1">
            {Icon && <Icon className="text-pink text-xl mt-1" />}
            <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                    {title}
                </h3>
                <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    {description}
                </p>
            </div>
        </div>

        {/* Toggle Switch */}
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onChange}
            className={`relative w-14 h-8 rounded-full transition-all ${checked
                ? 'bg-gradient-to-r from-pink to-pink-2'
                : theme === 'light' ? 'bg-gray-300' : 'bg-burgundy'
                }`}
        >
            <motion.div
                animate={{ x: checked ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-1 w-6 h-6 rounded-full shadow-md ${checked ? 'bg-white' : theme === 'light' ? 'bg-white' : 'bg-gray-400'
                    }`}
            />
        </motion.button>
    </div>
);

// Setting Button Component
const SettingButton = ({ icon: Icon, title, onClick, theme }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all
            ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}
    >
        <div className="flex items-center gap-3">
            <Icon className={`text-xl ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
            <span className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                {title}
            </span>
        </div>
        <FaChevronRight className={`${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`} />
    </motion.button>
);

export default AccountSetting;
