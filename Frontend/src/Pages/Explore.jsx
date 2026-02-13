import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FaHeart, FaTimes, FaStar, FaCamera, FaMapMarkerAlt, FaInfoCircle, FaLock } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import api from '../api/axios';

const Explore = () => {
    const navigate = useNavigate();
    const { theme } = useOutletContext();
    const [currentPhoto, setCurrentPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [swipeDirection, setSwipeDirection] = useState(null); // 'left' or 'right'
    const [showMatch, setShowMatch] = useState(false);
    const [matchedPhoto, setMatchedPhoto] = useState(null);
    const [isCoupleMode, setIsCoupleMode] = useState(false);
    const [partnerPhoto, setPartnerPhoto] = useState(null);

    // Motion values for drag
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);

    // Hoisted transforms to prevent conditional hook errors
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

    // Fetch next photo from backend
    const fetchNextPhoto = async () => {
        setLoading(true);
        try {
            // Check if user is in couple mode
            const currentUserResponse = await api.get('/auth/me');
            const user = currentUserResponse.data.user;
            const partner = user.pairedWith;

            if (partner) {
                setIsCoupleMode(true);
                // Fetch partner's profile/photo directly
                // partner might be object (populated) or string (id)
                const partnerId = partner._id || partner;

                const partnerResponse = await api.get(`/users/${partnerId}/photo`);
                setPartnerPhoto(partnerResponse.data.photo);
                setCurrentPhoto(partnerResponse.data.photo); // Set partner's photo as current
            } else {
                setIsCoupleMode(false);
                // Original logic: fetch next photo from swipe queue
                const response = await api.get('/swipe/next');
                setCurrentPhoto(response.data.photo);
            }
        } catch (error) {
            console.error('Error fetching photo:', error);
            if (error.response?.status === 404) {
                // No photos available or partner not found
                setCurrentPhoto(null);
                setPartnerPhoto(null);
            } else if (error.response?.status === 401) {
                // Not logged in
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

    // Record swipe
    const recordSwipe = async (direction) => {
        if (!currentPhoto) return;

        try {
            const response = await api.post('/swipe', {
                photoId: currentPhoto.url,
                direction: direction,
                photoOwnerId: currentPhoto.ownerId
            });

            if (response.data.matched) {
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
        // Animate the card off screen manually if button pressed
        // (For simplicity, we just trigger logic, x/rotate logic handles drag primarily)
        // If button clicked, we can maybe animate x manually? 
        // For now, let's just trigger recordSwipe and reset. 
        // To make it look like a swipe, we'd need to control 'x' with animation controls, which interacts with drag.
        // Simple approach: just fade out and fetch next.

        recordSwipe(direction);
    };

    const handleDragEnd = (event, info) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            recordSwipe('right');
        } else if (info.offset.x < -threshold) {
            recordSwipe('left');
        } else {
            // Snap back
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center relative overflow-hidden pb-20 md:pb-0">

            {/* Couple Mode Banner */}
            {isCoupleMode && (
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-16 md:top-10 z-30 px-6 py-2 rounded-full bg-pink-500/10 backdrop-blur-md border border-pink-500/20 flex items-center gap-2"
                >
                    <FaLock className="text-pink-500 text-sm" />
                    <span className="text-pink-500 text-sm font-semibold tracking-wide uppercase">
                        Couple Mode Active
                    </span>
                </motion.div>
            )}

            {/* Main Card Area */}
            {/* Added min-h and background color to ensure visibility */}
            <div className="relative z-10 w-full max-w-sm h-[60vh] min-h-[400px] md:h-[600px] mt-4 md:mt-32">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center"
                        >
                            {/* Pulse Effect */}
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className={`absolute inset-0 rounded-full ${theme === 'light' ? 'bg-pink-300' : 'bg-pink-700'}`}
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                    className={`absolute inset-0 rounded-full ${theme === 'light' ? 'bg-pink' : 'bg-pink-2'}`}
                                />
                                <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl
                                    ${theme === 'light' ? 'bg-white text-pink' : 'bg-gradient-to-br from-pink to-burgundy text-white'}`}>
                                    <FaHeart className="text-4xl text-heart-red" />
                                </div>
                            </div>
                            <h3 className={`mt-8 text-xl font-medium tracking-wide ${theme === 'light' ? 'text-burgundy' : 'text-white/80'}`}>
                                Finding people nearby...
                            </h3>
                        </motion.div>
                    ) : currentPhoto ? (
                        <motion.div
                            key={currentPhoto.url}
                            style={{ x, rotate, opacity, scale }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.7}
                            onDragEnd={handleDragEnd}
                            whileTap={{ cursor: 'grabbing' }}
                            initial={{ scale: 0.95, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full"
                        >
                            {/* Swipe Indicators (Overlay) */}
                            <motion.div
                                style={{ opacity: likeOpacity }}
                                className="absolute top-10 left-10 z-30 border-4 border-green-400 text-green-400 px-4 py-2 rounded-xl font-bold text-4xl rotate-[-15deg] tracking-widest uppercase bg-black/20 backdrop-blur-sm"
                            >
                                LIKE
                            </motion.div>
                            <motion.div
                                style={{ opacity: nopeOpacity }}
                                className="absolute top-10 right-10 z-30 border-4 border-red-500 text-red-500 px-4 py-2 rounded-xl font-bold text-4xl rotate-[15deg] tracking-widest uppercase bg-black/20 backdrop-blur-sm"
                            >
                                NOPE
                            </motion.div>

                            {/* Card Content */}
                            <div className={`relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl border bg-gray-900
                                ${theme === 'light' ? 'border-white/50 shadow-pink-200/50' : 'border-white/10 shadow-black/80'}`}>

                                <img
                                    src={currentPhoto.url}
                                    alt="Profile"
                                    className="w-full h-full object-cover pointer-events-none"
                                />

                                {/* Gradient Overlay - Burgundy Fade */}
                                <div className="absolute inset-0 bg-gradient-to-t from-burgundy via-transparent to-transparent opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-b from-burgundy/30 via-transparent to-transparent opacity-60" />

                                {/* Top Info */}
                                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                                    <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                                        <FaCamera className="text-white/90 text-xs" />
                                        <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">
                                            {currentPhoto.ownerName}'s Moment
                                        </span>
                                    </div>
                                    <div className="bg-black/30 backdrop-blur-md px-2 py-2 rounded-full border border-white/10">
                                        <FaInfoCircle className="text-white/80" />
                                    </div>
                                </div>

                                {/* Bottom Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                                    <h2 className="text-4xl font-bold mb-2 drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {currentPhoto.ownerName}, <span className="text-pink-400">20+</span>
                                    </h2>

                                    <div className="flex items-center gap-2 text-sm mb-4 text-white/80 font-medium">
                                        <FaMapMarkerAlt className="text-pink-500" />
                                        <span>Nearby • Active recently</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {['Music', 'Travel', 'Art'].map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase border border-white/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="no-more"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex flex-col items-center justify-center h-full text-center p-8 rounded-[32px] border
                                ${theme === 'light' ? 'bg-white/40 border-white/50' : 'bg-white/5 border-white/10'}`}
                        >
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
                                <FaCamera className={`text-4xl ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`} />
                            </div>
                            <h3 className={`text-2xl font-bold mb-3 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                No more profiles
                            </h3>
                            <p className={`${theme === 'light' ? 'text-gray-600' : 'text-white/50'} max-w-xs`}>
                                We've run out of people nearby. <br /> Check back later for more!
                            </p>
                            <button
                                onClick={fetchNextPhoto}
                                className="mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95"
                            >
                                Refresh
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-6 md:bottom-10 z-20 flex gap-6 md:gap-8 items-center">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('left')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all backdrop-blur-md
                        ${theme === 'light'
                            ? 'bg-white/80 border border-red-100 text-red-500 shadow-red-100'
                            : 'bg-black/40 border border-white/10 text-red-500 hover:bg-red-500/20'}`}
                >
                    <FaTimes className="text-3xl" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all backdrop-blur-md
                        ${theme === 'light'
                            ? 'bg-white/80 border border-blue-100 text-blue-400'
                            : 'bg-black/40 border border-white/10 text-blue-400 hover:bg-blue-500/20'}`}
                >
                    <FaStar className="text-xl" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('right')}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-pink to-heart-red flex items-center justify-center shadow-xl shadow-pink/30 border border-white/10"
                >
                    <FaHeart className="text-white text-3xl" />
                </motion.button>
            </div>

            {/* Match Modal */}
            <AnimatePresence>
                {showMatch && matchedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="text-center p-8 w-full max-w-lg"
                        >
                            <div className="relative mb-12">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
                                </motion.div>
                                <BsHeartFill className="text-pink-500 text-9xl mx-auto drop-shadow-[0_0_30px_rgba(236,72,153,0.5)] relative z-10" />
                                <FaHeart className="text-white text-4xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20" />
                            </div>

                            <h2 className="text-6xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                It's a Match!
                            </h2>
                            <p className="text-xl text-white/80 mb-12 font-light">
                                You and <span className="font-bold text-pink-400">{matchedPhoto.ownerName}</span> liked each other.
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => navigate('/soulmate')}
                                    className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all"
                                >
                                    Send a Message
                                </button>
                                <button
                                    onClick={() => setShowMatch(false)}
                                    className="w-full py-4 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                                >
                                    Keep Swiping
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Explore;
