/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaMoon, FaSun, FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import api from '../api/axios';

const SignupAndLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [activeTab, setActiveTab] = useState(location.pathname === '/login' ? 'login' : 'signup');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setActiveTab(location.pathname === '/login' ? 'login' : 'signup');

        // Extract invite token from URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            setFormData(prev => ({ ...prev, inviteToken: token }));
            setActiveTab('signup');
        }

        // Check for persistent login
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            navigate('/explore');
        }
    }, [location.pathname, location.search, navigate]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        inviteToken: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Background hearts state
    const [hearts, setHearts] = useState([]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        setHearts(Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 6 + Math.random() * 10,
            size: 14 + Math.random() * 20
        })));
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validateForm = () => {
        const newErrors = {};
        if (activeTab === 'signup') {
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            if (activeTab === 'signup') {
                console.log('Sending signup request...');
                const response = await api.post('/auth/signup', {
                    username: formData.email,
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    age: 25,
                    inviteToken: formData.inviteToken
                });
                console.log('Signup successful:', response.data);
                localStorage.setItem('isLoggedIn', 'true');
                navigate('/onboarding');
            } else {
                console.log('Sending login request...');
                const response = await api.post('/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                console.log('Login successful:', response.data);
                localStorage.setItem('isLoggedIn', 'true');
                navigate('/explore');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            const errorMessage = error.response?.data?.error || 'An error occurred';
            setErrors({ submit: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    // Styling Constants
    const isLight = theme === 'light';
    const pageBg = isLight
        ? 'bg-gradient-to-b from-[#FFFFFF] to-[#A8A7ED]'
        : 'bg-gradient-to-b from-[#09090F] to-[#12101F]';

    const textPrimary = isLight ? 'text-[#000407]' : 'text-[#F0EFFF]';
    const textSecondary = isLight ? 'text-[#000407] opacity-60' : 'text-[#F0EFFF] opacity-50';
    const accentColor = '#A8A7ED';

    const glassCardStyle = {
        background: isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(168, 167, 237, 0.05)',
        backdropFilter: 'blur(16px)',
        border: isLight ? '1px solid rgba(168, 167, 237, 0.2)' : '1px solid rgba(168, 167, 237, 0.1)',
        boxShadow: isLight ? '0 2px 12px rgba(168, 167, 237, 0.15)' : '0 2px 20px rgba(0, 0, 0, 0.4)',
    };

    const inputClass = `w-full px-4 py-3 rounded-[14px] outline-none transition-all duration-300 text-sm font-medium
    ${isLight
            ? 'bg-white/50 border border-[#A8A7ED]/20 text-[#000407] focus:border-[#A8A7ED] focus:ring-1 focus:ring-[#A8A7ED]'
            : 'bg-white/5 border border-[#A8A7ED]/10 text-white placeholder-white/30 focus:border-[#A8A7ED]/50 focus:ring-1 focus:ring-[#A8A7ED]/50'}`;

    const labelClass = `text-xs font-bold uppercase tracking-wider mb-1.5 block ${textSecondary}`;

    return (
        <div className={`min-h-screen relative flex flex-col items-center justify-center p-4 transition-colors duration-500 font-sans ${pageBg}`}>

            {/* Ambient Background Glow */}
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
                    className={`absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_0%,rgba(168,167,237,0.4),transparent_60%)]`}
                />
            </div>

            {/* Navbar */}
            <div className="absolute top-0 w-full z-50 px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[#A8A7ED]"
                    >
                        <FaHeart size={20} />
                    </motion.div>
                    <span className={`font-bold text-xl tracking-tight ${textPrimary}`}>
                        Swarsh
                    </span>
                </div>
                <button
                    onClick={toggleTheme}
                    className={`p-2.5 rounded-full transition-all ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    {isLight ? <FaMoon size={16} className="text-[#000407]" /> : <FaSun size={16} className="text-yellow-300" />}
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[420px] rounded-[32px] overflow-hidden relative z-10 p-8 md:p-10"
                style={glassCardStyle}
            >
                <div className="text-center mb-8">
                    <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                        {activeTab === 'signup' ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className={`text-sm ${textSecondary}`}>
                        {activeTab === 'signup' ? 'Join Swarsh today' : 'Log in to continue'}
                    </p>
                </div>

                {/* Tabs */}
                <div className={`grid grid-cols-2 p-1 rounded-xl mb-8 ${isLight ? 'bg-black/5' : 'bg-white/5'}`}>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`py-2 text-sm font-bold rounded-lg transition-all duration-300
                        ${activeTab === 'signup'
                                ? 'bg-white text-[#000407] shadow-sm'
                                : `${textSecondary} hover:text-opacity-80`}`}
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`py-2 text-sm font-bold rounded-lg transition-all duration-300
                        ${activeTab === 'login'
                                ? 'bg-white text-[#000407] shadow-sm'
                                : `${textSecondary} hover:text-opacity-80`}`}
                    >
                        Login
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-5"
                        >
                            {activeTab === 'signup' && (
                                <div>
                                    <label className={labelClass}>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        className={inputClass}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                                </div>
                            )}

                            {activeTab === 'signup' && (
                                <div>
                                    <label className={labelClass}>Invite Token</label>
                                    <input
                                        type="text"
                                        name="inviteToken"
                                        value={formData.inviteToken}
                                        onChange={handleChange}
                                        placeholder="Enter invite code"
                                        className={inputClass}
                                    />
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className={inputClass}
                                    autoComplete="email"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                            </div>

                            <div className="relative">
                                <label className={labelClass}>Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={inputClass}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 ${textSecondary} hover:text-opacity-100`}
                                    >
                                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                            </div>

                            {activeTab === 'signup' && (
                                <div className="relative">
                                    <label className={labelClass}>Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${textSecondary} hover:text-opacity-100`}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {errors.submit && <p className="text-red-500 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg">{errors.submit}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 w-full text-white py-3.5 rounded-[14px] font-bold transition-all shadow-lg shadow-[#A8A7ED]/25 hover:shadow-[#A8A7ED]/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        style={{ background: '#A8A7ED' }}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            activeTab === 'signup' ? 'Create Account' : 'Log In'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className={`text-sm ${textSecondary}`}>
                        {activeTab === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                        {' '}
                        <button
                            onClick={() => setActiveTab(activeTab === 'signup' ? 'login' : 'signup')}
                            className="font-bold hover:underline decoration-2 underline-offset-2"
                            style={{ color: '#A8A7ED' }}
                        >
                            {activeTab === 'signup' ? 'Log In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupAndLogin;
