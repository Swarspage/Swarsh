import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaBell, FaEnvelope, FaHeart, FaMoon, FaSun, FaLock,
    FaSignOutAlt, FaChevronRight, FaUser, FaShieldAlt
} from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import Navigation from '../components/Navigation';
import api from '../api/axios';

const AccountSetting = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    // Settings state
    const [settings, setSettings] = useState({
        notifications: {
            newMatches: true,
            messages: true,
            dateSuggestions: false
        }
    });

    // Theme sync
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

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
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden flex flex-col
            ${theme === 'light'
                ? 'bg-gradient-to-br from-pink-50 via-white to-pink-50'
                : 'bg-gradient-to-br from-[#1A0510] via-[#0A0005] to-[#1A0510]'}`}
        >
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl
                        ${theme === 'light' ? 'bg-pink-300/30' : 'bg-pink-600/20'}`}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className={`absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl
                        ${theme === 'light' ? 'bg-pink-200/30' : 'bg-pink-600/15'}`}
                />
            </div>

            {/* Header */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`relative z-50 px-6 md:px-12 h-20 flex items-center justify-between`}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <FaHeart className="text-pink-600 text-2xl" />
                    </motion.div>
                    <span className={`font-bold text-2xl tracking-wide ${theme === 'light' ? 'text-[#4A0E1F]' : 'text-white'}`}
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        Swarsh
                    </span>
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-3 rounded-full ${theme === 'light' ? 'hover:bg-pink-100' : 'hover:bg-white/10'}`}
                >
                    <FaBell className={`text-xl ${theme === 'light' ? 'text-gray-700' : 'text-white'}`} />
                </motion.button>
            </motion.nav>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex items-start justify-center px-4 pb-24 md:pb-8 md:pt-8 overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl"
                >
                    {/* Title */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center
                                ${theme === 'light' ? 'bg-pink-100' : 'bg-pink-900/30'}`}
                        >
                            <FaUser className="text-pink-600 text-3xl" />
                        </motion.div>
                        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            Account Settings
                        </h1>
                        <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            Manage your preferences and account details
                        </p>
                    </div>

                    {/* Settings Container */}
                    <div className="space-y-6">
                        {/* Notifications Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`rounded-2xl p-6 backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/80' : 'bg-black/40'}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <FaBell className="text-pink-600 text-xl" />
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
                            className={`rounded-2xl p-6 backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/80' : 'bg-black/40'}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <BsHeartFill className="text-pink-600 text-xl" />
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
                            className={`rounded-2xl p-6 backdrop-blur-xl
                                ${theme === 'light' ? 'bg-white/80' : 'bg-black/40'}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <FaShieldAlt className="text-pink-600 text-xl" />
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

            {/* Responsive Navigation */}
            <Navigation theme={theme} currentPage="settings" />
        </div>
    );
};

// Toggle Row Component
const ToggleRow = ({ icon: Icon, title, description, checked, onChange, theme }) => (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-all
        ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}>
        <div className="flex items-start gap-3 flex-1">
            {Icon && <Icon className="text-pink-600 text-xl mt-1" />}
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
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600'
                    : theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'
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
