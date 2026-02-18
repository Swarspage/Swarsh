/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
    FaBell, FaEnvelope, FaHeart, FaMoon, FaSun, FaLock,
    FaSignOutAlt, FaChevronRight, FaUser, FaShieldAlt, FaCopy
} from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import api from '../api/axios';

const AccountSetting = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useOutletContext();

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

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleNotification = (key) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('isLoggedIn');
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/');
        }
    };

    // Styling Constants
    const isLight = theme === 'light';

    // Core Colors & Gradients
    const pageBg = isLight
        ? 'bg-gradient-to-b from-[#FFFFFF] to-[#A8A7ED]'
        : 'bg-gradient-to-b from-[#09090F] to-[#12101F]';

    const cardStyle = {
        background: isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(168, 167, 237, 0.05)',
        backdropFilter: 'blur(16px)',
        border: isLight ? '1px solid rgba(168, 167, 237, 0.2)' : '1px solid rgba(168, 167, 237, 0.1)',
        boxShadow: isLight ? '0 2px 12px rgba(168, 167, 237, 0.15)' : '0 2px 20px rgba(0, 0, 0, 0.4)',
        borderRadius: '20px',
    };

    const textPrimary = isLight ? 'text-[#000407]' : 'text-[#F0EFFF]';
    const textSecondary = isLight ? 'text-[#000407] opacity-50' : 'text-[#F0EFFF] opacity-45';

    // Label above cards
    const sectionLabel = `text-[0.7rem] uppercase tracking-[0.1em] mb-2 pl-2 ${textSecondary}`;

    return (
        <div className={`min-h-screen w-full flex flex-col items-center py-8 px-6 font-sans transition-colors duration-500 ${pageBg}`}>

            <div className="w-full max-w-[560px] flex flex-col gap-5 pt-8">

                {/* 1. Header & Profile Row - 48px avatar circle with initials + username */}
                <div className="flex items-center gap-4 mb-2 pl-2">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 shadow-sm">
                            <img
                                src={user?.avatar || 'https://i.pravatar.cc/150?img=5'}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Status dot if needed, skipping for minimal look */}
                    </div>
                    <div>
                        <h1 className={`text-2xl font-bold tracking-tight leading-none mb-1 ${textPrimary}`}>
                            {user?.name || 'Account'}
                        </h1>
                        <p className={`text-sm ${textSecondary}`}>
                            {user?.email || 'Manage your settings'}
                        </p>
                    </div>
                </div>

                {/* 2. Relationship Status Card */}
                <div>
                    <div className={sectionLabel}>Relationship Status</div>
                    <div style={cardStyle} className="p-6">
                        {partnerName ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-pink-100/50 flex items-center justify-center text-pink-500 shadow-sm">
                                        <FaHeart size={16} />
                                    </div>
                                    <div>
                                        <p className={`text-xs uppercase tracking-wider font-bold mb-0.5 ${textSecondary}`}>Paired with</p>
                                        <p className={`text-lg font-bold ${textPrimary}`}>{partnerName}</p>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${isLight ? 'bg-[#A8A7ED]' : 'bg-[#A8A7ED] shadow-[0_0_8px_rgba(168,167,237,0.6)]'}`}></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className={`flex items-start gap-3 ${textSecondary} text-sm`}>
                                    <FaHeart className="mt-1 shrink-0 text-[#A8A7ED]" />
                                    <p>Share your invite code to connect with your soulmate.</p>
                                </div>

                                {inviteToken ? (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className={`flex-1 rounded-xl p-3 font-mono text-center tracking-widest text-lg select-all border border-transparent
                                            ${isLight ? 'bg-[#A8A7ED]/10 text-[#000407]' : 'bg-[#A8A7ED]/10 text-[#F0EFFF]'}`}>
                                            {inviteToken}
                                        </div>
                                        <button
                                            onClick={copyInvite}
                                            className="px-6 py-3 rounded-xl bg-[#A8A7ED] text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-medium text-sm shadow-sm hover:shadow-md"
                                        >
                                            <FaCopy /> <span>Copy</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="animate-pulse text-sm text-[#A8A7ED] font-medium">Generating unique code...</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Notifications Card */}
                <div>
                    <div className={sectionLabel}>Notifications</div>
                    <div style={cardStyle} className="p-6 space-y-6">
                        <ToggleRow
                            label="New Matches"
                            desc="Get notified when someone likes you"
                            checked={settings.notifications.newMatches}
                            onChange={() => toggleNotification('newMatches')}
                            isLight={isLight}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            icon={<FaHeart size={14} className="text-pink-400" />}
                        />
                        <ToggleRow
                            label="Messages"
                            desc="Receive alerts for new private messages"
                            checked={settings.notifications.messages}
                            onChange={() => toggleNotification('messages')}
                            isLight={isLight}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            icon={<FaEnvelope size={14} className="text-blue-400" />}
                        />
                        <ToggleRow
                            label="Date Suggestions"
                            desc="Weekly romantic date ideas nearby"
                            checked={settings.notifications.dateSuggestions}
                            onChange={() => toggleNotification('dateSuggestions')}
                            isLight={isLight}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            icon={<BsHeartFill size={14} className="text-yellow-400" />}
                        />
                    </div>
                </div>

                {/* 4. Appearance Toggle (Slim single row) */}
                <div className="flex items-center justify-between py-2 px-1">
                    <div className="flex items-center gap-3 pl-2">
                        <div className={`p-1.5 rounded-full ${isLight ? 'text-purple-500' : 'text-yellow-300'}`}>
                            {isLight ? <FaMoon size={16} /> : <FaSun size={16} />}
                        </div>
                        <span className={`font-medium ${textPrimary}`}>
                            {isLight ? 'Dark Mode' : 'Light Mode'}
                        </span>
                    </div>
                    <Switch checked={theme === 'dark'} onChange={toggleTheme} isLight={isLight} />
                </div>

                {/* 5. Account Security Card */}
                <div>
                    <div className={sectionLabel}>Account Security</div>
                    <div style={cardStyle} className="p-6 space-y-3">
                        <SecurityButton
                            icon={FaLock}
                            label="Change Password"
                            onClick={() => alert('Change Password feature coming soon!')}
                            isLight={isLight}
                            textPrimary={textPrimary}
                        />
                        <SecurityButton
                            icon={FaEnvelope}
                            label="Email Preferences"
                            onClick={() => alert('Email Preferences feature coming soon!')}
                            isLight={isLight}
                            textPrimary={textPrimary}
                        />
                    </div>
                </div>

                {/* 6. Logout - plain text, centered */}
                <div className="pt-6 pb-12 flex justify-center">
                    <button
                        onClick={handleLogout}
                        className={`text-sm font-medium ${textSecondary} hover:text-[#FF6B6B] transition-colors relative group py-2 px-4`}
                    >
                        Log out
                        <span className="absolute bottom-1 left-1/2 w-0 h-[1px] bg-[#FF6B6B] transition-all group-hover:w-full group-hover:left-0"></span>
                    </button>
                </div>

            </div>
        </div>
    );
};

// --- Sub-components ---

const Switch = ({ checked, onChange, isLight }) => (
    <div
        onClick={onChange}
        className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${checked ? 'bg-[#A8A7ED]' : (isLight ? 'bg-[#E5E5F0]' : 'bg-[#1E1C30]')
            }`}
    >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-6' : 'left-1'
            }`} />
    </div>
);

const ToggleRow = ({ label, desc, checked, onChange, isLight, textPrimary, textSecondary, icon }) => (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onChange}>
        <div className="flex items-start gap-4">
            {/* Optional: Icon indicator */}
            {/* <div className={`mt-1 opacity-70`}>{icon}</div> */}
            <div>
                <div className={`text-sm font-semibold ${textPrimary} mb-0.5`}>{label}</div>
                <div className={`text-xs ${textSecondary}`}>{desc}</div>
            </div>
        </div>
        <Switch checked={checked} onChange={onChange} isLight={isLight} />
    </div>
);

const SecurityButton = ({ icon: Icon, label, onClick, isLight, textPrimary }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 rounded-[14px] transition-all hover:bg-opacity-20 active:scale-[0.98]"
        style={{ background: 'rgba(168,167,237,0.08)' }}
    >
        <div className="flex items-center gap-3">
            <div className="text-[#A8A7ED] opacity-80">
                <Icon size={16} />
            </div>
            <span className={`font-medium text-sm ${textPrimary}`}>{label}</span>
        </div>
        <FaChevronRight className="text-[#A8A7ED] text-xs opacity-60" />
    </button>
);

export default AccountSetting;
