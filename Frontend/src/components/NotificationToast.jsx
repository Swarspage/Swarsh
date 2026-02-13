import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaBell, FaTimes, FaStar } from 'react-icons/fa';

const NotificationToast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'match': return <FaHeart className="text-pink text-xl" />;
            case 'like': return <FaStar className="text-yellow-400 text-xl" />;
            case 'message': return <FaBell className="text-blue-400 text-xl" />;
            default: return <FaBell className="text-white text-xl" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed top-24 right-4 z-[9999] max-w-sm w-full"
        >
            <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 text-white overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink/10 via-purple-500/10 to-transparent pointer-events-none" />

                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0 z-10">
                    <h4 className="font-bold text-sm tracking-wide uppercase text-pink-2 mb-0.5">
                        {type === 'match' ? "It's a Match!" : type === 'message' ? "New Message" : "Notification"}
                    </h4>
                    <p className="text-sm text-white/80 truncate font-light">
                        {message}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <FaTimes className="text-white/50 hover:text-white" />
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationToast;
