/* eslint-disable no-unused-vars */
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
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [showMatch, setShowMatch] = useState(false);
    const [matchedPhoto, setMatchedPhoto] = useState(null);
    const [isCoupleMode, setIsCoupleMode] = useState(false);
    const [partnerPhoto, setPartnerPhoto] = useState(null);

    // Motion values for drag
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

    // Fetch next photo from backend
    const fetchNextPhoto = async () => {
        setLoading(true);
        try {
            const currentUserResponse = await api.get('/auth/me');
            const user = currentUserResponse.data.user;
            const partner = user.pairedWith;

            if (partner) {
                setIsCoupleMode(true);
                const partnerId = partner._id || partner;
                const partnerResponse = await api.get(`/users/${partnerId}/photo`);
                setPartnerPhoto(partnerResponse.data.photo);
                setCurrentPhoto(partnerResponse.data.photo);
            } else {
                setIsCoupleMode(false);
                const response = await api.get('/swipe/next');
                setCurrentPhoto(response.data.photo);
            }
        } catch (error) {
            console.error('Error fetching photo:', error);
            if (error.response?.status === 404) {
                setCurrentPhoto(null);
                setPartnerPhoto(null);
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
        recordSwipe(direction);
    };

    const handleDragEnd = (event, info) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            recordSwipe('right');
        } else if (info.offset.x < -threshold) {
            recordSwipe('left');
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
        boxShadow: isLight ? '0 2px 12px rgba(168, 167, 237, 0.15)' : '0 2px 20px rgba(0, 0, 0, 0.4)',
    };

    return (
        <div className={`h-full flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 font-sans ${pageBg}`}>

            {/* Couple Mode Banner */}
            {isCoupleMode && (
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-[#A8A7ED]/10 backdrop-blur-md border border-[#A8A7ED]/20 flex items-center gap-2"
                >
                    <FaLock className="text-[#A8A7ED] text-xs" />
                    <span className="text-[#A8A7ED] text-xs font-bold tracking-wide uppercase">
                        Couple Mode
                    </span>
                </motion.div>
            )}

            {/* Main Card Area */}
            <div className="relative z-10 w-full max-w-sm h-[60vh] min-h-[450px] md:h-[580px] mt-2 px-4">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center"
                        >
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-2 border-[#A8A7ED]/20 animate-ping" />
                                <div className="w-12 h-12 rounded-full bg-[#A8A7ED]/20 flex items-center justify-center">
                                    <FaHeart className="text-[#A8A7ED] animate-pulse" />
                                </div>
                            </div>
                            <p className={`mt-4 text-sm font-medium ${textSecondary} tracking-wide`}>
                                Finding connections...
                            </p>
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
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full px-4"
                        >
                            {/* Swipe Indicators */}
                            <motion.div
                                style={{ opacity: likeOpacity }}
                                className="absolute top-8 left-8 z-30 px-4 py-1 rounded-lg border-2 border-green-400 text-green-400 font-bold text-2xl -rotate-12 bg-black/20 backdrop-blur-sm"
                            >
                                LIKE
                            </motion.div>
                            <motion.div
                                style={{ opacity: nopeOpacity }}
                                className="absolute top-8 right-8 z-30 px-4 py-1 rounded-lg border-2 border-red-500 text-red-500 font-bold text-2xl rotate-12 bg-black/20 backdrop-blur-sm"
                            >
                                NOPE
                            </motion.div>

                            {/* Card Content */}
                            <div className="relative w-full h-full rounded-[32px] overflow-hidden"
                                style={{
                                    boxShadow: isLight ? '0 20px 40px -10px rgba(168,167,237,0.3)' : '0 20px 40px -10px rgba(0,0,0,0.5)',
                                    background: isLight ? 'white' : '#1E1C30'
                                }}>

                                <img
                                    src={currentPhoto.url}
                                    alt="Profile"
                                    className="w-full h-full object-cover pointer-events-none"
                                />

                                {/* Subtle Gradient for Readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                                {/* Info Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                                    <h2 className="text-3xl font-bold mb-1 leading-tight">
                                        {currentPhoto.ownerName}
                                    </h2>

                                    <div className="flex items-center gap-1.5 text-sm mb-4 text-white/80 font-medium">
                                        <FaMapMarkerAlt className="text-[#A8A7ED]" size={12} />
                                        <span>Nearby</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {['Music', 'Travel', 'Art'].map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
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
                            className="flex flex-col items-center justify-center h-full text-center p-8 rounded-[32px]"
                            style={glassStyle}
                        >
                            <div className="w-16 h-16 rounded-full bg-[#A8A7ED]/10 flex items-center justify-center mb-4">
                                <FaCamera className="text-2xl text-[#A8A7ED]" />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>
                                No more profiles
                            </h3>
                            <p className={`text-sm ${textSecondary} max-w-xs mb-6`}>
                                Check back later for more people nearby.
                            </p>
                            <button
                                onClick={fetchNextPhoto}
                                className="px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-lg transition-all active:scale-95"
                                style={{ background: '#A8A7ED' }}
                            >
                                Refresh
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Buttons - Relative Positioning */}
            <div className="flex gap-8 items-center mt-6 z-20">
                <button
                    onClick={() => handleSwipe('left')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl border
                    ${isLight
                            ? 'bg-white text-gray-400 border-gray-100 hover:text-red-500'
                            : 'bg-[#1E1C30] text-gray-500 border-white/5 hover:text-red-500'}`}
                >
                    <FaTimes size={24} />
                </button>

                <button
                    onClick={() => handleSwipe('right')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl shadow-[#A8A7ED]/40
                    ${isLight
                            ? 'bg-[#A8A7ED] text-white'
                            : 'bg-[#A8A7ED] text-white'}`}
                >
                    <FaHeart size={24} />
                </button>
            </div>

            {/* Match Modal */}
            <AnimatePresence>
                {showMatch && matchedPhoto && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="text-center w-full max-w-sm"
                        >
                            <div className="relative mb-8">
                                <BsHeartFill className="text-[#A8A7ED] text-7xl mx-auto drop-shadow-2xl" />
                                <FaHeart className="text-white text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>

                            <h2 className="text-4xl font-bold text-white mb-2">
                                It's a Match!
                            </h2>
                            <p className="text-white/70 mb-8">
                                You and <span className="font-bold text-[#A8A7ED]">{matchedPhoto.ownerName}</span> liked each other.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/soulmate')}
                                    className="w-full py-3.5 rounded-full text-white font-bold shadow-lg"
                                    style={{ background: '#A8A7ED' }}
                                >
                                    Send a Message
                                </button>
                                <button
                                    onClick={() => setShowMatch(false)}
                                    className="w-full py-3.5 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20"
                                >
                                    Keep Swiping
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Explore;
