import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHeart, FaSearch, FaPaperPlane, FaPhone, FaVideo, FaEllipsisV,
    FaImage, FaSmile, FaArrowLeft, FaCheck, FaCheckDouble, FaCircle
} from 'react-icons/fa';
import { BsHeartFill, BsEmojiSmile, BsThreeDots } from 'react-icons/bs';
import api from '../api/axios';

const Soulmate = () => {
    const navigate = useNavigate();
    const { socket, theme } = useOutletContext();
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [lightboxImage, setLightboxImage] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch matches from backend
    const fetchMatches = async () => {
        try {
            const response = await api.get('/match');
            const matchesData = response.data.matches.map(match => {
                const otherUser = match.user1Id._id === response.data.currentUserId
                    ? match.user2Id
                    : match.user1Id;

                const avatar = otherUser.profilePicture ||
                    (otherUser.uploadedPhotos && otherUser.uploadedPhotos[0]) ||
                    'https://i.pravatar.cc/150?img=1';

                return {
                    id: match._id,
                    userId: otherUser._id,
                    name: otherUser.name || 'Unknown',
                    lastMessage: "Start a conversation! 💕", // Ideally fetch real last message
                    time: 'Now',
                    unread: 0,
                    online: false, // Socket should update this
                    avatar: avatar
                };
            });
            setMatches(matchesData);
            // Default to first match on desktop if none selected
            if (matchesData.length > 0 && !selectedMatch && window.innerWidth >= 768) {
                // optional: setSelectedMatch(matchesData[0]);
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
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            if (selectedMatch && (message.senderId._id === selectedMatch.userId || message.receiverId === selectedMatch.userId)) {
                setMessages(prev => [...prev, message]);
            }
            // Update last message in sidebar (could implement here)
        };

        const handleTyping = ({ userId, typing }) => {
            if (selectedMatch?.userId === userId) {
                setIsTyping(typing);
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleTyping);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
        };
    }, [socket, selectedMatch]);

    useEffect(() => {
        if (selectedMatch) {
            fetchMessages(selectedMatch.userId);
            // Join room logic if needed
        }
    }, [selectedMatch]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

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

            if (socket) {
                socket.emit('stop_typing', { receiverId: selectedMatch.userId, senderId: response.data.message.senderId });
            }
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

    const handleInput = (e) => {
        setNewMessage(e.target.value);
        if (socket && selectedMatch) {
            socket.emit('typing', { receiverId: selectedMatch.userId });
            // Should implement debounce for stop_typing here
        }
    };

    const filteredMatches = matches.filter(match =>
        match.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Animation Variants
    const messageVariants = {
        hidden: (isSender) => ({
            opacity: 0,
            x: isSender ? 20 : -20,
            scale: 0.9
        }),
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className={`flex h-[calc(100vh-80px)] md:h-screen w-full relative overflow-hidden transition-colors duration-500
            ${theme === 'light' ? 'bg-pink-50' : 'bg-burgundy'}`}>

            {/* --- LEFT SIDEBAR --- */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`w-full md:w-[380px] h-full flex flex-col border-r relative z-10 backdrop-blur-xl
                    ${selectedMatch ? 'hidden md:flex' : 'flex'} 
                    ${theme === 'light' ? 'bg-white/80 border-white/60' : 'bg-gradient-to-b from-burgundy via-burgundy-dark to-black border-white/5'}`}
            >
                {/* Gradient Overlay (Dark mode only) */}
                {theme !== 'light' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-pink/5 to-transparent pointer-events-none"></div>
                )}

                {/* Header */}
                <div className="p-6 relative z-10">
                    <h2 className={`text-3xl font-bold mb-6 drop-shadow-lg bg-clip-text text-transparent
                        ${theme === 'light' ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-pink-200'}`}
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        Messages
                    </h2>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className={`absolute inset-0 blur-md opacity-20 group-focus-within:opacity-40 transition-opacity rounded-2xl
                            ${theme === 'light' ? 'bg-pink-400' : 'bg-pink'}`}></div>
                        <div className={`relative flex items-center border rounded-2xl px-4 py-3 backdrop-blur-md transition-all 
                            ${theme === 'light'
                                ? 'bg-white/50 border-white/60 group-focus-within:border-pink-300 group-focus-within:bg-white/80'
                                : 'bg-white/5 border-white/10 group-focus-within:border-pink/50 group-focus-within:bg-white/10'}`}>
                            <FaSearch className={`${theme === 'light' ? 'text-gray-400 group-focus-within:text-pink-600' : 'text-white/40 group-focus-within:text-pink'}`} />
                            <input
                                type="text"
                                placeholder="Search soulmates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full bg-transparent border-none outline-none ml-3 font-medium
                                    ${theme === 'light' ? 'text-gray-800 placeholder-gray-400' : 'text-white placeholder-white/30'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Matches List */}
                <div className={`flex-1 overflow-y-auto px-4 pb-20 md:pb-0 space-y-2 relative z-10
                    ${theme === 'light' ? 'scrollbar-thin-light' : 'scrollbar-thin scrollbar-thumb-pink/20'}`}>
                    {filteredMatches.map((match) => (
                        <motion.div
                            key={match.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedMatch(match)}
                            className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border
                                ${selectedMatch?.id === match.id
                                    ? (theme === 'light'
                                        ? 'bg-white shadow-lg border-white/60'
                                        : 'bg-gradient-to-r from-pink/20 to-transparent border-pink/30 shadow-lg shadow-pink/5')
                                    : (theme === 'light'
                                        ? 'border-transparent hover:bg-white/40'
                                        : 'border-transparent hover:bg-white/5')}`}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className={`w-14 h-14 rounded-full p-[2px] 
                                    ${selectedMatch?.id === match.id
                                        ? 'bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600'
                                        : (theme === 'light' ? 'bg-gray-200' : 'bg-white/10')}`}>
                                    <img src={match.avatar} className={`w-full h-full rounded-full object-cover border-2 ${theme === 'light' ? 'border-white' : 'border-black'}`} />
                                </div>
                                {match.online && (
                                    <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`font-bold text-lg truncate 
                                        ${selectedMatch?.id === match.id
                                            ? (theme === 'light' ? 'text-gray-900' : 'text-white')
                                            : (theme === 'light' ? 'text-gray-700' : 'text-white/80')}`}>
                                        {match.name}
                                    </h3>
                                    <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`}>{match.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-sm truncate flex items-center gap-1 
                                        ${match.lastMessage.toLowerCase().includes('love')
                                            ? (theme === 'light' ? 'text-pink-500 italic' : 'text-pink-300 italic')
                                            : (theme === 'light' ? 'text-gray-500' : 'text-white/50')}`}>
                                        {match.lastMessage.toLowerCase().includes('love') && <FaHeart size={10} />}
                                        {match.lastMessage}
                                    </p>
                                    {match.unread > 0 && (
                                        <div className="w-5 h-5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-pink/30">
                                            <span className="text-white text-[10px] font-bold">{match.unread}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {filteredMatches.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 opacity-50">
                            <FaHeart className={`text-4xl mb-4 ${theme === 'light' ? 'text-gray-300' : 'text-white/20'}`} />
                            <p className={`${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`}>No matches found</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* --- RIGHT SIDE - CHAT AREA --- */}
            {selectedMatch ? (
                <div className={`flex-1 flex flex-col h-full relative md:ml-0 z-20 md:z-auto
                    ${theme === 'light' ? 'bg-pink-50/50' : 'bg-black'}`}>

                    {/* Background Pattern */}
                    {theme !== 'light' ? (
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <svg width="100%" height="100%">
                                <pattern id="chat-wave" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M0 10 Q 25 20, 50 10 T 100 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                                <rect width="100%" height="100%" fill="url(#chat-wave)" />
                            </svg>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    )}

                    {/* Chat Header */}
                    <div className={`px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl relative z-10 shadow-sm
                        ${theme === 'light' ? 'bg-white/70 border-white/60' : 'bg-black/40 border-white/5'}`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedMatch(null)} className={`md:hidden p-2 -ml-2 
                                ${theme === 'light' ? 'text-gray-500 hover:text-gray-800' : 'text-white/70 hover:text-white'}`}>
                                <FaArrowLeft />
                            </button>
                            <div className="relative cursor-pointer hover:scale-105 transition-transform">
                                <img src={selectedMatch.avatar} className={`w-11 h-11 rounded-full object-cover border-2 ${theme === 'light' ? 'border-white shadow-md' : 'border-white/10'}`} />
                                {selectedMatch.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                )}
                            </div>
                            <div>
                                <h3 className={`font-bold text-xl ${theme === 'light' ? 'text-gray-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200'}`}>
                                    {selectedMatch.name}
                                </h3>
                                <p className="text-xs font-medium flex items-center gap-2">
                                    {isTyping ? <span className="text-pink-500 animate-pulse">Typing...</span> : (
                                        selectedMatch.online ?
                                            <span className="text-green-500 flex items-center gap-1"><FaCircle size={6} /> Active now</span> :
                                            <span className={`${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`}>Offline</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Header Actions */}
                            {[FaPhone, FaVideo, FaEllipsisV].map((Icon, i) => (
                                <button key={i} className={`p-3 rounded-full transition-all hover:scale-110 active:scale-95
                                    ${theme === 'light' ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                                    <Icon />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-4 
                        ${theme === 'light' ? 'scrollbar-thin-light' : 'scrollbar-thin scrollbar-thumb-white/10'}`}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center pb-20">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse
                                    ${theme === 'light' ? 'bg-white shadow-lg border border-pink-100' : 'bg-gradient-to-br from-pink/20 to-purple-500/20'}`}>
                                    <BsHeartFill className={`text-4xl drop-shadow-md ${theme === 'light' ? 'text-pink-500' : 'text-pink'}`} />
                                </div>
                                <h3 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>It's a Match!</h3>
                                <p className={`max-w-xs ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                                    Start your romantic journey with <span className={theme === 'light' ? 'text-pink-600 font-semibold' : 'text-pink-200'}>{selectedMatch.name}</span>. Say hello! 👋
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isSenderMatch = msg.senderId?._id === selectedMatch.userId || msg.senderId === selectedMatch.userId;
                                return (
                                    <motion.div
                                        key={msg._id || index}
                                        custom={!isSenderMatch}
                                        initial="hidden"
                                        animate="visible"
                                        variants={messageVariants}
                                        className={`flex items-end gap-3 ${!isSenderMatch ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {isSenderMatch && <img src={selectedMatch.avatar} className="w-8 h-8 rounded-full mb-2 shadow-sm" />}

                                        <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${!isSenderMatch ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-5 py-3 text-[15px] leading-relaxed shadow-sm relative group
                                                ${!isSenderMatch
                                                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-[24px] rounded-br-[4px] shadow-pink-500/20'
                                                    : (theme === 'light'
                                                        ? 'bg-white text-gray-800 border border-white/60 rounded-[24px] rounded-bl-[4px] shadow-md'
                                                        : 'bg-white/10 backdrop-blur-md text-white border border-white/5 rounded-[24px] rounded-bl-[4px]')}`}
                                            >
                                                {msg.content}

                                                {/* Hover Reactions (Visual Only) */}
                                                <div className={`absolute top-1/2 -translate-y-1/2 ${!isSenderMatch ? '-left-24' : '-right-24'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1 rounded-full
                                                    ${theme === 'light' ? 'bg-white shadow-lg border border-white/60' : 'bg-black/60 backdrop-blur-md'}`}>
                                                    {['❤️', '😂', '🔥', '👍'].map(emoji => (
                                                        <button key={emoji} className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform">{emoji}</button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Meta: Time & Status */}
                                            <div className="flex items-center gap-1 mt-1 px-1">
                                                <span className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`}>
                                                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {!isSenderMatch && (
                                                    <span className="text-blue-500 text-xs ml-1"><FaCheckDouble /></span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                        {isTyping && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                                <img src={selectedMatch.avatar} className="w-8 h-8 rounded-full shadow-sm" />
                                <div className={`px-4 py-3 rounded-2xl rounded-bl-sm border flex gap-1
                                    ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-white/10 backdrop-blur-md border-white/5'}`}>
                                    {[0, 1, 2].map(i => (
                                        <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                            className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-pink-400' : 'bg-pink'}`} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className={`p-4 md:p-6 pb-28 md:pb-32 border-t relative z-20 backdrop-blur-xl
                        ${theme === 'light' ? 'bg-white/70 border-white/60' : 'bg-black/60 border-white/5'}`}>
                        <div className={`max-w-4xl mx-auto flex items-end gap-3 border rounded-[28px] p-2 pr-2 transition-all shadow-sm
                            ${theme === 'light'
                                ? 'bg-white/50 border-white/60 focus-within:bg-white focus-within:border-pink-300 focus-within:shadow-md'
                                : 'bg-white/5 border-white/10 focus-within:bg-white/10 focus-within:border-pink/30'}`}>
                            <button className={`p-3 rounded-full transition-colors
                                ${theme === 'light' ? 'text-gray-400 hover:text-pink-600 hover:bg-pink-50' : 'text-white/50 hover:text-pink hover:bg-white/5'}`}>
                                <FaImage size={20} />
                            </button>
                            <textarea
                                value={newMessage}
                                onChange={handleInput}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a romantic message..."
                                className={`flex-1 bg-transparent border-none outline-none py-3 max-h-32 resize-none scrollbar-hide
                                    ${theme === 'light' ? 'text-gray-800 placeholder-gray-500' : 'text-white placeholder-white/30'}`}
                                rows={1}
                            />
                            <button className={`p-3 rounded-full transition-colors
                                ${theme === 'light' ? 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50' : 'text-white/50 hover:text-yellow-400 hover:bg-white/5'}`}>
                                <BsEmojiSmile size={20} />
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: -10 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all
                                    ${newMessage.trim()
                                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 shadow-pink-500/30 hover:shadow-pink-500/50'
                                        : (theme === 'light' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white/10 text-white/30 cursor-not-allowed')}`}
                            >
                                <FaPaperPlane className="-ml-1 mt-0.5" />
                            </motion.button>
                        </div>
                    </div>

                </div>
            ) : (
                /* --- EMPTY STATE (Desktop) --- */
                <div className={`hidden md:flex flex-1 items-center justify-center flex-col text-center relative overflow-hidden
                    ${theme === 'light' ? 'bg-pink-50' : 'bg-black'}`}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    <div className="relative z-10 p-12">
                        <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-8 mx-auto animate-pulse border
                            ${theme === 'light'
                                ? 'bg-white border-pink-100 shadow-xl'
                                : 'bg-gradient-to-br from-pink/10 to-purple-900/10 border-white/5'}`}>
                            <BsHeartFill className={`text-7xl opacity-50 drop-shadow-lg ${theme === 'light' ? 'text-pink-300' : 'text-pink'}`} />
                        </div>
                        <h2 className={`text-4xl font-bold mb-4 drop-shadow-sm ${theme === 'light' ? 'text-gray-800' : 'text-white'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                            Your Soulmate Awaits
                        </h2>
                        <p className={`text-lg font-light max-w-md mx-auto leading-relaxed ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                            Select a conversation from the left to rekindle the spark. <br />
                            Every message is a heartbeat closer.
                        </p>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxImage(null)} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                        <img src={lightboxImage} className="max-w-full max-h-full rounded-lg shadow-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Soulmate;
