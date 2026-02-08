import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaCamera, FaBell } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';

const Navigation = ({ theme, currentPage }) => {
    const navigate = useNavigate();

    const navItems = [
        { id: 'explore', label: 'EXPLORE', icon: FaHeart, path: '/explore' },
        { id: 'soulmate', label: 'SOULMATE', icon: BsHeartFill, path: '/soulmate' },
        { id: 'profile', label: 'PROFILE', icon: FaCamera, path: '/profile' },
        { id: 'settings', label: 'SETTINGS', icon: FaBell, path: '/settings' }
    ];

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={`fixed left-0 right-0 z-50 px-8 py-4
                ${theme === 'light'
                    ? 'bg-white/80 border-gray-200'
                    : 'bg-black/60 border-white/10'} 
                backdrop-blur-xl
                bottom-0 border-t md:top-0 md:bottom-auto md:border-b md:border-t-0`}
        >
            <div className="max-w-md mx-auto md:max-w-7xl flex justify-around md:justify-center md:gap-8 items-center">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className={`p-3 rounded-full ${isActive
                                    ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                                    : theme === 'light' ? 'bg-gray-100' : 'bg-white/10'
                                }`}>
                                <Icon className={`text-xl ${isActive
                                        ? 'text-white'
                                        : theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                    }`} />
                            </div>
                            <span className={`text-xs font-medium ${isActive
                                    ? 'text-pink-600 font-bold'
                                    : theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                {item.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default Navigation;
