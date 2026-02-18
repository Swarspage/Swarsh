/* eslint-disable no-unused-vars */
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

        const buttonWidth = 200;
        const buttonHeight = 80;
        const padding = 20;

        const maxLeft = vw - buttonWidth - padding;
        const maxTop = vh - buttonHeight - padding;

        const safeMaxLeft = Math.max(0, maxLeft);
        const safeMaxTop = Math.max(0, maxTop);

        let randomX, randomY;
        let attempts = 0;

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

    // Core Theme Colors Matches AccountSetting.jsx
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

    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden flex flex-col font-sans ${pageBg}`}>

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
                    className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px]
                        ${isLight ? 'bg-[#A8A7ED]/20' : 'bg-[#A8A7ED]/10'}`}
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
                    className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px]
                        ${isLight ? 'bg-[#A8A7ED]/20' : 'bg-[#7C3AED]/10'}`}
                />
            </div>

            {/* Floating Hearts Background (More subtle now) */}
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
                            className={isLight ? 'text-[#A8A7ED]' : 'text-[#A8A7ED]'}
                            style={{ filter: 'blur(1px)' }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Navbar */}
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 w-full z-50 px-6 md:px-12 h-20 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[#A8A7ED]"
                    >
                        <FaHeart size={24} />
                    </motion.div>
                    <span className={`font-bold text-2xl tracking-tight ${textPrimary}`}>
                        Swarsh
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/signup')}
                        className={`px-5 py-2 rounded-full font-medium text-sm transition-all border
                        ${isLight
                                ? 'bg-white/50 border-[#A8A7ED]/30 text-[#000407] hover:bg-white hover:border-[#A8A7ED]'
                                : 'bg-white/5 border-[#A8A7ED]/20 text-white hover:bg-white/10 hover:border-[#A8A7ED]/40'}`}
                    >
                        Log In
                    </motion.button>

                    <motion.button
                        whileHover={{ rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-full transition-all ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        {isLight ?
                            <FaMoon className="text-[#000407] text-lg" /> :
                            <FaSun className="text-yellow-300 text-lg" />
                        }
                    </motion.button>
                </div>
            </motion.nav>

            {/* Main Content */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 pt-20 pb-8 w-full">

                {/* Sharu Title with Glow */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-10 text-center relative max-w-full"
                >
                    <motion.h1
                        className="text-7xl md:text-9xl font-bold tracking-tighter leading-none break-words"
                        style={{
                            fontFamily: "'Inter', sans-serif", // Clean font now
                            color: isLight ? '#A8A7ED' : '#F0EFFF',
                            textShadow: isLight ? '0 4px 20px rgba(168, 167, 237, 0.3)' : '0 4px 30px rgba(168, 167, 237, 0.2)'
                        }}
                    >
                        Sharu
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className={`mt-4 text-lg font-medium tracking-wide uppercase ${isLight ? 'text-[#000407]/60' : 'text-[#F0EFFF]/60'}`}
                    >
                        My Dearest
                    </motion.p>
                </motion.div>

                {/* Glass Card with Question */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    className="rounded-[32px] p-8 md:p-12 w-full max-w-xl text-center relative overflow-hidden"
                    style={glassCardStyle}
                >
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className={`text-3xl md:text-4xl font-bold mb-10 leading-tight ${textPrimary}`}
                    >
                        Will you be my valentine?
                    </motion.h2>

                    {/* Buttons Container */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative min-h-[60px]">

                        {/* Yes Button */}
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleYesClick}
                            className="px-10 py-3.5 rounded-full font-bold text-lg text-white shadow-lg shadow-[#A8A7ED]/30 relative overflow-hidden group w-full sm:w-auto"
                            style={{ background: '#A8A7ED' }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Yes <FaHeart className="text-sm" />
                            </span>
                            {/* Shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.5 }}
                            />
                        </motion.button>

                        {/* No Button - Placeholder */}
                        <div className={`relative w-full sm:w-auto ${isMoved ? 'pointer-events-none opacity-0' : ''}`}>
                            <motion.button
                                onMouseEnter={!isMoved ? moveNoButton : undefined}
                                onTouchStart={!isMoved ? moveNoButton : undefined}
                                onClick={!isMoved ? moveNoButton : undefined}
                                className={`w-full sm:w-auto px-10 py-3.5 rounded-full font-bold text-lg border transition-all flex items-center justify-center gap-2
                                ${isLight
                                        ? 'bg-transparent border-[#000407]/10 text-[#000407]/70'
                                        : 'bg-transparent border-[#F0EFFF]/10 text-[#F0EFFF]/70'}`}
                            >
                                <span>No</span>
                                <span className="text-sm opacity-60">💔</span>
                            </motion.button>
                        </div>

                        {/* Portal Button (The one that moves) */}
                        {isMoved && createPortal(
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1, x: noBtnPosition.x, y: noBtnPosition.y }}
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
                                className={`px-10 py-3.5 rounded-full font-bold text-lg border shadow-xl flex items-center gap-2
                                ${isLight
                                        ? 'bg-white border-gray-200 text-gray-500'
                                        : 'bg-[#1E1C30] border-white/10 text-gray-400'}`}
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
                            className={`mt-6 text-sm font-medium ${textSecondary}`}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full py-6 text-center z-10 relative"
            >
                <div className={`text-xs font-medium flex items-center justify-center gap-1.5 ${textSecondary}`}>
                    Made with
                    <FaHeart className="text-[#A8A7ED]" size={10} />
                    for love
                </div>
            </motion.footer>
        </div>
    );
};

export default LandingPage;