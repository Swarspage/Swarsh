import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaSearch, FaPaperPlane, FaPhone, FaVideo, FaEllipsisV, FaImage, FaSmile, FaBell, FaCamera } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import { io } from 'socket.io-client';
import api from '../api/axios';
import Navigation from '../components/Navigation';

const Soulmate = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Theme sync
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Fetch matches from backend
    const fetchMatches = async () => {
        try {
            const response = await api.get('/match');
            // Transform matches to include user info
            const matchesData = response.data.matches.map(match => {
                // Determine the other user (not current user)
                const otherUser = match.user1Id._id === response.data.currentUserId
                    ? match.user2Id
                    : match.user1Id;

                // Get profile picture - use profilePicture or first uploaded photo
                const avatar = otherUser.profilePicture ||
                    (otherUser.uploadedPhotos && otherUser.uploadedPhotos[0]) ||
                    'https://i.pravatar.cc/150?img=1';

                return {
                    id: match._id,
                    userId: otherUser._id,
                    name: otherUser.name || 'Unknown',
                    lastMessage: "Start a conversation! 💕",
                    time: 'Now',
                    unread: 0,
                    online: false,
                    avatar: avatar
                };
            });
            setMatches(matchesData);
            if (matchesData.length > 0 && !selectedMatch) {
                setSelectedMatch(matchesData[0]);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    };

    // Fetch messages for selected match
    const fetchMessages = async (matchUserId) => {
        try {
            const response = await api.get(`/message/conversation/${matchUserId}`);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        fetchMatches();

        // Setup Socket.io
        socketRef.current = io('http://localhost:5000', {
            withCredentials: true
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
        });

        socketRef.current.on('new_message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        socketRef.current.on('user_typing', ({ userId, typing }) => {
            if (selectedMatch?.userId === userId) {
                setIsTyping(typing);
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (selectedMatch) {
            fetchMessages(selectedMatch.userId);
        }
    }, [selectedMatch]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedMatch) return;

        try {
            const response = await api.post('/message', {
                receiverId: selectedMatch.userId,
                content: newMessage
            });

            setMessages(prev => [...prev, response.data.message]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Filter matches by search
    const filteredMatches = matches.filter(match =>
        match.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden flex
            ${theme === 'light'
                ? 'bg-gradient-to-br from-pink-50 via-white to-pink-50'
                : 'bg-gradient-to-br from-[#1A0510] via-[#0A0005] to-[#1A0510]'}`}
        >
            {/* Header */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-20 flex items-center justify-between
                    ${theme === 'light' ? 'bg-white/80' : 'bg-black/60'} backdrop-blur-xl border-b
                    ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}
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

                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3 rounded-full ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                    >
                        <FaBell className={`text-xl ${theme === 'light' ? 'text-gray-700' : 'text-white'}`} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3 rounded-full ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                    >
                        <BsHeartFill className={`text-xl ${theme === 'light' ? 'text-gray-700' : 'text-white'}`} />
                    </motion.button>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center cursor-pointer">
                        <span className="text-white font-bold">S</span>
                    </div>
                </div>
            </motion.nav>

            {/* Main Content */}
            <div className="w-full h-screen pt-20 md:pt-24 pb-16 md:pb-0 flex">
                {/* Left Sidebar - Matches List */}
                <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-full md:w-96 h-full border-r overflow-y-auto
                        ${theme === 'light' ? 'bg-white/60 border-gray-200' : 'bg-black/40 border-white/10'} backdrop-blur-xl`}
                >
                    {/* Sidebar Header */}
                    <div className="p-6">
                        <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            Messages
                        </h2>

                        {/* Search */}
                        <div className={`relative mb-4`}>
                            <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                                type="text"
                                placeholder="Search soulmates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all
                                    ${theme === 'light'
                                        ? 'bg-gray-100 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-200'
                                        : 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/30'}`}
                            />
                        </div>
                    </div>

                    {/* Matches List */}
                    <div className="px-3">
                        {filteredMatches.map((match, index) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedMatch(match)}
                                className={`flex items-center gap-3 p-4 mb-2 rounded-xl cursor-pointer transition-all
                                    ${selectedMatch?.id === match.id
                                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                                        : theme === 'light'
                                            ? 'hover:bg-pink-50 text-gray-800'
                                            : 'hover:bg-white/10 text-white'}`}
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <img
                                        src={match.avatar}
                                        alt={match.name}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                    {match.online && (
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold truncate">{match.name}</h3>
                                        <span className={`text-xs ${selectedMatch?.id === match.id ? 'text-white/80' : theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {match.time}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate ${selectedMatch?.id === match.id ? 'text-white/80' : theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {match.lastMessage}
                                        </p>
                                        {match.unread > 0 && selectedMatch?.id !== match.id && (
                                            <div className="ml-2 w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">{match.unread}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filteredMatches.length === 0 && (
                            <div className="text-center py-12">
                                <BsHeartFill className={`text-6xl mx-auto mb-4 ${theme === 'light' ? 'text-gray-300' : 'text-gray-700'}`} />
                                <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    No matches yet
                                </p>
                                <p className={`text-sm mt-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Keep swiping to find your soulmate!
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Side - Chat Area */}
                {selectedMatch ? (
                    <div className="flex-1 flex flex-col h-full">
                        {/* Chat Header */}
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`flex items-center justify-between px-6 py-4 border-b
                                ${theme === 'light' ? 'bg-white/60 border-gray-200' : 'bg-black/40 border-white/10'} backdrop-blur-xl`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={selectedMatch.avatar}
                                        alt={selectedMatch.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    {selectedMatch.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className={`font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                        {selectedMatch.name}
                                    </h3>
                                    <p className={`text-sm ${selectedMatch.online ? 'text-green-500' : theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {selectedMatch.online ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-3 rounded-full ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                                >
                                    <FaPhone className={`${theme === 'light' ? 'text-gray-700' : 'text-white'}`} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-3 rounded-full ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                                >
                                    <FaVideo className={`${theme === 'light' ? 'text-gray-700' : 'text-white'}`} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-3 rounded-full ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                                >
                                    <FaEllipsisV className={`${theme === 'light' ? 'text-gray-700' : 'text-white'}`} />
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Messages Area */}
                        <div className={`flex-1 overflow-y-auto p-6 space-y-4
                            ${theme === 'light' ? 'bg-pink-50/30' : 'bg-black/20'}`}
                        >
                            {/* Date Divider */}
                            <div className="flex items-center justify-center my-4">
                                <span className={`px-4 py-1 rounded-full text-xs ${theme === 'light' ? 'bg-gray-200 text-gray-600' : 'bg-white/10 text-gray-400'}`}>
                                    Today, 2:14 PM
                                </span>
                            </div>

                            {/* Sample Messages */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3"
                            >
                                <img src={selectedMatch.avatar} alt="" className="w-10 h-10 rounded-full" />
                                <div>
                                    <div className={`px-4 py-3 rounded-2xl rounded-tl-none max-w-md
                                        ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-white/10 text-white'}`}
                                    >
                                        Happy Valentine's Day! 💕 Did you get the flowers?
                                    </div>
                                    <span className={`text-xs mt-1 ml-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        2:15 PM
                                    </span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3 justify-end"
                            >
                                <div className="text-right">
                                    <div className="px-4 py-3 rounded-2xl rounded-tr-none max-w-md bg-gradient-to-r from-pink-500 to-pink-600 text-white inline-block">
                                        Yes! They are beautiful. You're the best.
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-1">
                                        <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                            2:16 PM
                                        </span>
                                        <span className="text-pink-500">✓✓</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3"
                            >
                                <img src={selectedMatch.avatar} alt="" className="w-10 h-10 rounded-full" />
                                <div>
                                    <div className={`px-4 py-3 rounded-2xl rounded-tl-none max-w-md flex items-center gap-2
                                        ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-white/10 text-white'}`}
                                    >
                                        I'm glad you liked them. Any plans for tonight?
                                        <BsHeartFill className="text-pink-500" />
                                    </div>
                                    <span className={`text-xs mt-1 ml-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        2:18 PM
                                    </span>
                                </div>
                            </motion.div>

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-start gap-3"
                                >
                                    <img src={selectedMatch.avatar} alt="" className="w-10 h-10 rounded-full" />
                                    <div className={`px-5 py-3 rounded-2xl rounded-tl-none
                                        ${theme === 'light' ? 'bg-white' : 'bg-white/10'}`}
                                    >
                                        <div className="flex gap-1">
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity }}
                                                className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-gray-400' : 'bg-gray-500'}`}
                                            />
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-gray-400' : 'bg-gray-500'}`}
                                            />
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-gray-400' : 'bg-gray-500'}`}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className={`p-4 border-t ${theme === 'light' ? 'bg-white/60 border-gray-200' : 'bg-black/40 border-white/10'} backdrop-blur-xl`}>
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-3 rounded-full ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                                >
                                    <FaImage className={`text-xl ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-3 rounded-full ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                                >
                                    <FaSmile className={`text-xl ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
                                </motion.button>
                                <input
                                    type="text"
                                    placeholder="Type a romantic message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className={`flex-1 px-6 py-3 rounded-full outline-none transition-all
                                        ${theme === 'light'
                                            ? 'bg-gray-100 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-200'
                                            : 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/30'}`}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={sendMessage}
                                    className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/40"
                                >
                                    <FaPaperPlane />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <BsHeartFill className={`text-8xl mx-auto mb-6 ${theme === 'light' ? 'text-gray-300' : 'text-gray-700'}`} />
                            <h3 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                Select a conversation
                            </h3>
                            <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                Choose a match to start messaging
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Responsive Navigation */}
            <Navigation theme={theme} currentPage="soulmate" />
        </div>
    );
};

export default Soulmate;
