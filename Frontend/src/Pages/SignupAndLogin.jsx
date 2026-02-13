
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaMoon, FaSun, FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import api from '../api/axios';

const SignupAndLogin = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const location = useLocation();
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
    }, [location.pathname, location.search]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
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
                // Signup API call
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
                navigate('/onboarding');
            } else {
                // Login API call
                console.log('Sending login request...');
                const response = await api.post('/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                console.log('Login successful:', response.data);
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
        // Clear error for field
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 border
    ${theme === 'light'
            ? 'bg-gray-50 border-gray-200 focus:border-pink-vibrant focus:ring-2 focus:ring-pink-vibrant/20 text-gray-800'
            : 'bg-white/5 border-white/10 focus:border-pink-vibrant focus:ring-2 focus:ring-pink-vibrant/20 text-white placeholder-gray-400'}`;

    const labelClass = `text-sm font-medium mb-1 block ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`;

    return (
        <div className={`min-h-screen relative flex flex-col transition-colors duration-300
      ${theme === 'light' ? 'bg-blush' : 'bg-burgundy'}`}
        >
            {/* Background Hearts */}
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="absolute pointer-events-none"
                    initial={{ y: '110vh', x: `${heart.left}vw`, opacity: 0 }}
                    animate={{
                        y: '-10vh',
                        opacity: [0, 0.2, 0.4, 0.2, 0],
                        rotate: [0, 90, 180, 270, 360]
                    }}
                    transition={{ duration: heart.duration, repeat: Infinity, delay: heart.delay, ease: "linear" }}
                    style={{ left: `${heart.left}vw` }}
                >
                    <BsHeartFill size={heart.size} color={theme === 'light' ? '#C62828' : '#E91E63'} className="opacity-20" />
                </motion.div>
            ))}

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 h-16 flex items-center justify-between backdrop-blur-md bg-transparent">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <FaHeart className="text-pink-vibrant text-2xl" />
                    <span className={`font-bold text-xl tracking-wide font-serif ${theme === 'light' ? 'text-burgundy' : 'text-white'}`}>
                        Swarsh
                    </span>
                </div>
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    {theme === 'light' ? <FaMoon className="text-burgundy" /> : <FaSun className="text-yellow-300" />}
                </button>
            </nav>

            <div className="flex-grow flex items-center justify-center p-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden relative backdrop-blur-xl border border-white/10
            ${theme === 'light' ? 'bg-white/80' : 'bg-[#2A141E]/90'}`}
                >
                    <div className="p-8">
                        <h2 className={`text-3xl font-serif text-center mb-8 
              ${theme === 'light' ? 'text-burgundy' : 'text-pink-vibrant'}`}>
                            Swarsh
                        </h2>

                        {/* Tabs */}
                        <div className="flex bg-gray-200/20 rounded-xl p-1 mb-8 relative">
                            <div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-pink-vibrant rounded-lg transition-all duration-300 ease-in-out"
                                style={{ left: activeTab === 'signup' ? '4px' : 'calc(50% + 0px)' }}
                            />
                            <button
                                onClick={() => setActiveTab('signup')}
                                className={`flex-1 py-1 text-sm font-semibold rounded-lg z-10 transition-colors duration-300
                  ${activeTab === 'signup' ? 'text-white' : (theme === 'light' ? 'text-gray-600' : 'text-gray-300')}`}
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg z-10 transition-colors duration-300
                  ${activeTab === 'login' ? 'text-white' : (theme === 'light' ? 'text-gray-600' : 'text-gray-300')}`}
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
                                            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                        </div>
                                    )}

                                    {activeTab === 'signup' && (
                                        <div>
                                            <label className={labelClass}>Invite Token (Required)</label>
                                            <input
                                                type="text"
                                                name="inviteToken"
                                                value={formData.inviteToken}
                                                onChange={handleChange}
                                                placeholder="Enter invite code"
                                                className={inputClass}
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                Only the first user can skip this. All others need an invite.
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className={labelClass}>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            className={inputClass}
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                                    </div>

                                    <div className="relative">
                                        <label className={labelClass}>Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Create a password"
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className={`absolute right-4 top-[38px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                                    </div>

                                    {activeTab === 'signup' && (
                                        <div className="relative">
                                            <label className={labelClass}>Confirm Password</label>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm your password"
                                                className={inputClass}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className={`absolute right-4 top-[38px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-4 w-full bg-pink-vibrant text-white py-3.5 rounded-xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    activeTab === 'signup' ? 'Create Account' : 'Login'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                {activeTab === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                                {' '}
                                <button
                                    onClick={() => setActiveTab(activeTab === 'signup' ? 'login' : 'signup')}
                                    className="text-pink-vibrant font-semibold hover:underline"
                                >
                                    {activeTab === 'signup' ? 'Login' : 'Sign Up'}
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Decorative Corner Hearts */}
                    <FaHeart className="absolute -top-4 -left-4 text-pink-vibrant/10 text-6xl rotate-[-20deg]" />
                    <FaHeart className="absolute -bottom-4 -right-4 text-pink-vibrant/10 text-6xl rotate-[-20deg]" />
                </motion.div>
            </div >
        </div >
    );
};

export default SignupAndLogin;
