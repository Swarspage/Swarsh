import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FaHeart, FaTimes, FaStar, FaCamera, FaMapMarkerAlt, FaBell } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import api from '../api/axios';
import Navigation from '../components/Navigation';

const Explore = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [currentPhoto, setCurrentPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [showMatch, setShowMatch] = useState(false);
    const [matchedPhoto, setMatchedPhoto] = useState(null);

    // Motion values for drag
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

    // Theme sync
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Fetch next photo from backend using axios
    const fetchNextPhoto = async () => {
        setLoading(true);
        try {
            const response = await api.get('/swipe/next');
            setCurrentPhoto(response.data.photo);
        } catch (error) {
            console.error('Error fetching photo:', error);
            if (error.response?.status === 404) {
                // No photos available
                setCurrentPhoto(null);
            } else if (error.response?.status === 401) {
                // Not logged in - redirect to login
                console.log('Not logged in, redirecting...');
                // navigate('/login');
            } else {
                setCurrentPhoto(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNextPhoto();
    }, []);

    // Record swipe using axios
    const recordSwipe = async (direction) => {
        if (!currentPhoto) return;

        try {
            const response = await api.post('/swipe', {
                photoId: currentPhoto.url,
                direction: direction,
                photoOwnerId: currentPhoto.ownerId
            });

            if (response.data.matched) {
                // Show match animation
                setMatchedPhoto(currentPhoto);
                setShowMatch(true);
                setTimeout(() => {
                    setShowMatch(false);
                    fetchNextPhoto();
                }, 3000);
            } else {
                fetchNextPhoto();
            }
        } catch (error) {
            console.error('Error recording swipe:', error);
            fetchNextPhoto();
        }
    };

    const handleSwipe = (direction) => {
        setSwipeDirection(direction);
        setTimeout(() => {
            recordSwipe(direction);
            setSwipeDirection(null);
            x.set(0);
        }, 300);
    };

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            handleSwipe('right');
        } else if (info.offset.x < -100) {
            handleSwipe('left');
        } else {
            x.set(0);
        }
    };

    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden flex flex-col
            ${theme === 'light'
                ? 'bg-gradient-to-br from-pink-200 via-pink-50 to-white'
                : 'bg-gradient-to-br from-[#4A0E1F] via-[#2A0E1A] to-[#1A0510]'}`}
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

            {/* Main Card Area */}
            <div className="relative z-10 flex-grow flex items-center justify-center px-4 pb-24 md:pb-8 md:pt-8">
                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="inline-block"
                                >
                                    <FaHeart className="text-pink-500 text-6xl" />
                                </motion.div>
                                <p className={`mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    Finding your match...
                                </p>
                            </motion.div>
                        ) : currentPhoto ? (
                            <motion.div
                                key={currentPhoto.url}
                                style={{ x, rotate, opacity }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleDragEnd}
                                className="relative cursor-grab active:cursor-grabbing"
                                whileTap={{ cursor: 'grabbing' }}
                            >
                                {/* Swipe Indicators */}
                                <motion.div
                                    className="absolute top-8 left-8 z-20 border-4 border-green-500 text-green-500 px-6 py-3 font-bold text-2xl rounded-xl rotate-[-15deg]"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{
                                        opacity: x.get() > 50 ? 1 : 0,
                                        scale: x.get() > 50 ? 1 : 0.5
                                    }}
                                >
                                    LIKE
                                </motion.div>
                                <motion.div
                                    className="absolute top-8 right-8 z-20 border-4 border-red-500 text-red-500 px-6 py-3 font-bold text-2xl rounded-xl rotate-[15deg]"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{
                                        opacity: x.get() < -50 ? 1 : 0,
                                        scale: x.get() < -50 ? 1 : 0.5
                                    }}
                                >
                                    NOPE
                                </motion.div>

                                {/* Card */}
                                <div className={`relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl
                                    ${theme === 'light' ? 'shadow-pink-200/50' : 'shadow-black/50'}`}>
                                    {/* Photo */}
                                    <img
                                        src={currentPhoto.url}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Owner Badge */}
                                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <FaCamera className="text-white text-sm" />
                                        <span className="text-white text-sm font-medium">
                                            {currentPhoto.ownerName}'s moment
                                        </span>
                                    </div>

                                    {/* Info at Bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {currentPhoto.ownerName}, 24
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm mb-3">
                                            <FaMapMarkerAlt className="text-pink-400" />
                                            <span>New Delhi, India</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium uppercase">
                                                Photography
                                            </span>
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium uppercase">
                                                Travel
                                            </span>
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium uppercase">
                                                Coffee
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="no-photos"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className={`text-center p-12 rounded-3xl ${theme === 'light' ? 'bg-white/60' : 'bg-black/40'} backdrop-blur-xl`}
                            >
                                <FaCamera className={`text-6xl mx-auto mb-4 ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`} />
                                <h3 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                    No photos available
                                </h3>
                                <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    Check back later for more moments to explore!
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    {!loading && currentPhoto && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex justify-center items-center gap-6 mt-8"
                        >
                            {/* Nope Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleSwipe('left')}
                                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all
                                    ${theme === 'light'
                                        ? 'bg-white border-2 border-gray-200 hover:border-red-400'
                                        : 'bg-white/10 border-2 border-white/20 hover:border-red-400'}`}
                            >
                                <FaTimes className="text-red-500 text-2xl" />
                            </motion.button>

                            {/* Super Like Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all
                                    ${theme === 'light'
                                        ? 'bg-white border-2 border-gray-200 hover:border-blue-400'
                                        : 'bg-white/10 border-2 border-white/20 hover:border-blue-400'}`}
                            >
                                <FaStar className="text-blue-500 text-xl" />
                            </motion.button>

                            {/* Like Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleSwipe('right')}
                                className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-xl shadow-pink-500/40"
                            >
                                <FaHeart className="text-white text-2xl" />
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Responsive Navigation */}
            <Navigation theme={theme} currentPage="explore" />

            {/* Match Overlay */}
            <AnimatePresence>
                {showMatch && matchedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0]
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 0.5
                                }}
                            >
                                <BsHeartFill className="text-pink-500 text-8xl mx-auto mb-6" />
                            </motion.div>
                            <h2 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                                It's a Match! 💕
                            </h2>
                            <p className="text-xl text-gray-300 mb-8">
                                You both loved this moment!
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Explore;
