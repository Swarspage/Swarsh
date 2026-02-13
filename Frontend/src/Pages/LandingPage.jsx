import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaMoon, FaSun } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';

import bearKissGif from '../assets/bear kiss GIF.gif';
import happyDancingGif from '../assets/Happy Happy Happy Dancing GIF.gif';

const LandingPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });
    const [isMoved, setIsMoved] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [dodgeCount, setDodgeCount] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);

    // Theme effect
    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Improved No button dodge with better boundaries
    const moveNoButton = (e) => {
        e?.preventDefault(); // Prevent click handling if it was a tap
        setDodgeCount(prev => prev + 1);

        const vw = Math.min(window.innerWidth, document.documentElement.clientWidth);
        const vh = Math.min(window.innerHeight, document.documentElement.clientHeight);

        // Estimate button size (safe estimates)
        const buttonWidth = 200; // slightly larger to be safe
        const buttonHeight = 80;
        const padding = 20; // Reduce padding to allow more movement space on mobile

        // Calculate available space
        const maxLeft = vw - buttonWidth - padding;
        const maxTop = vh - buttonHeight - padding;

        // Ensure we have positive values
        const safeMaxLeft = Math.max(0, maxLeft);
        const safeMaxTop = Math.max(0, maxTop);

        let randomX, randomY;
        let attempts = 0;

        // Keep trying until we find a position far enough from current position
        do {
            randomX = Math.max(padding, Math.random() * safeMaxLeft);
            randomY = Math.max(padding, Math.random() * safeMaxTop);
            attempts++;
        } while (attempts < 10 && isMoved &&
        Math.abs(randomX - noBtnPosition.x) < 100 &&
            Math.abs(randomY - noBtnPosition.y) < 100);

        setIsMoved(true);
        setNoBtnPosition({ x: randomX, y: randomY });
    };

    // Generate floating hearts
    useEffect(() => {
        const newHearts = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 8 + Math.random() * 8,
            size: 16 + Math.random() * 24,
            opacity: 0.15 + Math.random() * 0.2
        }));
        setHearts(newHearts);
    }, []);

    const handleYesClick = () => {
        setShowCelebration(true);
        setTimeout(() => {
            navigate('/signup');
        }, 5000);
    };

    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden flex flex-col
            ${theme === 'light'
                ? 'bg-gradient-to-br from-blush via-white to-pink-100 text-burgundy'
                : 'bg-gradient-to-br from-burgundy-dark to-[#2A0E1A] text-white'}`}
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
                        ${theme === 'light' ? 'bg-pink-300/30' : 'bg-pink-vibrant/20'}`}
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
                        ${theme === 'light' ? 'bg-pink-200/30' : 'bg-pink-vibrant/15'}`}
                />
            </div>

            {/* Floating Hearts Background */}
            <AnimatePresence>
                {hearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        className="absolute pointer-events-none"
                        initial={{ y: '110vh', opacity: 0 }}
                        animate={{
                            y: '-10vh',
                            x: [0, 20, -20, 0],
                            opacity: [0, heart.opacity, heart.opacity, 0],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                            duration: heart.duration,
                            repeat: Infinity,
                            delay: heart.delay,
                            ease: "linear",
                            x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        style={{ left: `${heart.left}vw` }}
                    >
                        <BsHeartFill
                            size={heart.size}
                            className={theme === 'light' ? 'text-pink-400' : 'text-pink-vibrant'}
                            style={{ filter: 'blur(1px)' }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`fixed top-0 w-full z-50 px-6 md:px-12 h-20 flex items-center justify-between
                    ${theme === 'light'
                        ? 'bg-transparent'
                        : 'bg-transparent'}`}
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

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex gap-8 text-sm font-medium">
                        <button className={`hover:text-pink-600 transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Stories
                        </button>
                        <button className={`hover:text-pink-600 transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Couples
                        </button>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/signup')}
                        className={`px-6 py-2.5 rounded-full font-semibold transition-all text-sm shadow-lg
                        ${theme === 'light'
                                ? 'bg-white text-[#4A0E1F] hover:bg-pink-50 shadow-pink-200/50'
                                : 'bg-white/10 text-white hover:bg-white/20 shadow-black/20'}`}
                    >
                        Log In
                    </motion.button>

                    <motion.button
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-full transition-all ${theme === 'light' ? 'hover:bg-pink-100' : 'hover:bg-white/10'}`}
                    >
                        {theme === 'light' ?
                            <FaMoon className="text-[#4A0E1F] text-lg" /> :
                            <FaSun className="text-yellow-300 text-lg" />
                        }
                    </motion.button>
                </div>
            </motion.nav>

            {/* Main Content */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 pt-20 pb-8 w-full">

                {/* Sharu Title with Glow */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-8 md:mb-12 text-center relative max-w-full"
                >
                    <motion.h1
                        animate={{
                            textShadow: [
                                '0 0 20px rgba(233,30,99,0.3)',
                                '0 0 40px rgba(233,30,99,0.5)',
                                '0 0 20px rgba(233,30,99,0.3)',
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-7xl md:text-9xl lg:text-[10rem] leading-none text-pink-600 break-words"
                        style={{
                            fontFamily: "'Great Vibes', cursive",
                            filter: 'drop-shadow(0 4px 10px rgba(233,30,99,0.3))'
                        }}
                    >
                        Sharu
                    </motion.h1>
                    {/* Decorative underline */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '40%' }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-0.5 bg-gradient-to-r from-transparent via-pink-600 to-transparent mx-auto mt-2"
                    />
                </motion.div>

                {/* Glass Card with Question */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className={`rounded-3xl md:rounded-[40px] p-8 md:p-12 lg:p-16 max-w-2xl w-full text-center backdrop-blur-xl relative
                        ${theme === 'light'
                            ? 'bg-white/30 border border-white/50 shadow-xl shadow-pink-200/30'
                            : 'bg-black/30 border border-white/10 shadow-2xl shadow-black/40'}`}
                >
                    {/* Corner Hearts Decoration */}
                    <div className="absolute top-4 left-4 opacity-20">
                        <FaHeart className="text-[#C62828] text-xl" />
                    </div>
                    <div className="absolute top-4 right-4 opacity-20">
                        <FaHeart className="text-[#C62828] text-xl" />
                    </div>

                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className={`text-3xl md:text-4xl lg:text-5xl mb-10 md:mb-12 font-medium leading-tight
                        ${theme === 'light' ? 'text-burgundy' : 'text-white'}`}
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Will you be my valentine?
                    </motion.h2>

                    {/* Buttons Container */}
                    <div className="flex flex-col sm:flex-row gap-5 md:gap-6 justify-center items-center relative min-h-[80px]">

                        {/* Yes Button */}
                        <motion.button
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.08, boxShadow: '0 10px 40px rgba(233,30,99,0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleYesClick}
                            className="bg-pink text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl shadow-pink/40 flex items-center gap-2.5 hover:bg-pink-2 transition-all relative overflow-hidden group"
                        >
                            <span className="relative z-10">Yes</span>
                            <FaHeart className="text-base relative z-10 group-hover:scale-125 transition-transform" />
                            {/* Shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />
                        </motion.button>

                        {/* No Button - Placeholder (preserves layout) */}
                        <div className={`relative ${isMoved ? 'pointer-events-none opacity-0' : ''}`}>
                            <motion.button
                                onMouseEnter={!isMoved ? moveNoButton : undefined}
                                onTouchStart={!isMoved ? moveNoButton : undefined}
                                onClick={!isMoved ? moveNoButton : undefined}
                                className={`px-12 py-4 rounded-full font-bold text-lg border-2 transition-all duration-500 flex items-center gap-2.5 shadow-lg cursor-pointer
                                ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-[#4A0E1F] hover:bg-gray-50 shadow-gray-200/50'
                                        : 'bg-transparent border-white/40 text-white hover:bg-white/5 shadow-black/30'}`}
                            >
                                <span>No</span>
                                <span className="text-sm">💔</span>
                            </motion.button>
                        </div>

                        {/* Portal Button (The one that moves) */}
                        {isMoved && createPortal(
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1, x: noBtnPosition.x, y: noBtnPosition.y }}
                                // We use animate x/y instead of left/top style for smoother framer motion performance
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }}
                                onMouseEnter={moveNoButton}
                                onTouchStart={moveNoButton}
                                onClick={moveNoButton}
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    zIndex: 9999,
                                }}
                                className={`px-12 py-4 rounded-full font-bold text-lg border-2 flex items-center gap-2.5 shadow-lg cursor-pointer
                                ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-[#4A0E1F] shadow-gray-200/50'
                                        : 'bg-gray-900 border-white/40 text-white shadow-black/50'}`}
                            >
                                <span>No</span>
                                <span className="text-sm">💔</span>
                            </motion.button>,
                            document.body
                        )}
                    </div>

                    {/* Fun message after dodging */}
                    {dodgeCount > 0 && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-8 text-sm italic ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}
                        >
                            {dodgeCount === 1 && "Oops! The button ran away 😏"}
                            {dodgeCount === 2 && "It's shy! Try the other one? 💕"}
                            {dodgeCount >= 4 && "Come on, you know you want to! 💖"}
                        </motion.p>
                    )}
                </motion.div>

                {/* Celebration GIFs */}
                <AnimatePresence>
                    {showCelebration && (
                        <>
                            {/* Left GIF: Happy Dancing */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, x: -100 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="fixed left-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-10 z-50 w-40 h-40 md:w-64 md:h-64 pointer-events-none"
                            >
                                <img src={happyDancingGif} alt="Celebration 1" className="w-full h-full object-contain" />
                            </motion.div>

                            {/* Right GIF: Bear Kiss */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, x: 100 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="fixed right-0 top-0 md:top-1/2 md:-translate-y-1/2 md:right-10 z-50 w-40 h-40 md:w-64 md:h-64 pointer-events-none"
                            >
                                <img src={bearKissGif} alt="Celebration 2" className="w-full h-full object-contain" />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="w-full py-8 text-center z-10 relative"
            >
                <p className={`mb-3 text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                    Don't have an account?{' '}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/signup')}
                        className="text-pink font-bold hover:underline underline-offset-2 ml-1"
                    >
                        Create one
                    </motion.button>
                </p>
                <p className="text-xs flex items-center justify-center gap-1.5"
                    style={{ color: theme === 'light' ? '#9CA3AF' : '#6B7280' }}>
                    © 2024 Swarsh. Made with
                    <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <FaHeart className="text-pink-400 text-xs" />
                    </motion.span>
                    for love.
                </p>
            </motion.footer>
        </div>
    );
};

export default LandingPage;