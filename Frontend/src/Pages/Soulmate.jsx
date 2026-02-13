import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaSearch, FaPaperPlane, FaPhone, FaVideo, FaEllipsisV, FaImage, FaSmile, FaArrowLeft } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
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
    const messagesEndRef = useRef(null);

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
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            // Check if the message belongs to the current selected conversation
            if (selectedMatch && (message.senderId._id === selectedMatch.userId || message.receiverId === selectedMatch.userId)) {
                setMessages(prev => [...prev, message]);
            }
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
            // Join room logic if needed, or just rely on global socket listening
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

            // Emit stop typing
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

            // Debounce stop typing
            // (Simplified here)
        }
    };

    // Filter matches by search
    const filteredMatches = matches.filter(match =>
        match.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-80px)] md:h-screen w-full relative overflow-hidden">

            {/* Left Sidebar - Matches List */}
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`w-full md:w-96 h-full flex flex-col border-r
                    ${selectedMatch ? 'hidden md:flex' : 'flex'} // Hide on mobile if chat open
                    ${theme === 'light' ? 'bg-white/60 border-gray-200' : 'bg-black/20 border-white/5'} backdrop-blur-xl`}
            >
                {/* Sidebar Header */}
                <div className="p-6 pb-2">
                    <h2 className={`text-3xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        Messages
                    </h2>

                    {/* Search */}
                    <div className="relative mb-4">
                        <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`} />
                        <input
                            type="text"
                            placeholder="Search soulmates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 rounded-2xl outline-none transition-all
                                ${theme === 'light'
                                    ? 'bg-gray-100/50 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-200'
                                    : 'bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:ring-1 focus:ring-pink-500/30'}`}
                        />
                    </div>
                </div>

                {/* Matches List */}
                <div className="flex-1 overflow-y-auto px-3 pb-20 md:pb-0">
                    {filteredMatches.map((match, index) => (
                        <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedMatch(match)}
                            className={`flex items-center gap-4 p-4 mb-2 rounded-2xl cursor-pointer transition-all group
                                ${selectedMatch?.id === match.id
                                    ? 'bg-white/10 shadow-lg border border-white/5'
                                    : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className={`p-0.5 rounded-full ${selectedMatch?.id === match.id ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-transparent'}`}>
                                    <img
                                        src={match.avatar}
                                        alt={match.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-transparent"
                                    />
                                </div>
                                {match.online && (
                                    <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`font-semibold text-lg truncate ${theme === 'light' ? 'text-gray-800' : 'text-white group-hover:text-pink-200 transition-colors'}`}>
                                        {match.name}
                                    </h3>
                                    <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`}>
                                        {/* Simple time logic here or format timestamp */}
                                        {match.time}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-sm truncate ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                                        {match.lastMessage}
                                    </p>
                                    {match.unread > 0 && (
                                        <div className="ml-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
                                            <span className="text-white text-[10px] font-bold">{match.unread}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {filteredMatches.length === 0 && (
                        <div className="text-center py-12 px-6">
                            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <BsHeartFill className={`text-3xl ${theme === 'light' ? 'text-gray-300' : 'text-white/20'}`} />
                            </div>
                            <p className={`font-medium ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                                No matches found
                            </p>
                            <p className="text-sm text-white/30 mt-1">
                                Keep exploring to find your soulmate!
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Right Side - Chat Area */}
            {selectedMatch ? (
                <div className={`flex-1 flex flex-col h-full absolute md:relative inset-0 z-20 md:z-auto bg-black // Fix z-index for mobile
                     ${theme === 'light' ? 'bg-white/90' : 'bg-[#0f0205] md:bg-transparent'}`}>

                    {/* Chat Header */}
                    <div className={`flex items-center justify-between px-6 py-4 border-b
                        ${theme === 'light' ? 'bg-white/80 border-gray-200' : 'bg-black/20 border-white/5'} backdrop-blur-md`}>

                        <div className="flex items-center gap-4">
                            {/* Back Button (Mobile) */}
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="md:hidden p-2 -ml-2 text-white/70 hover:text-white"
                            >
                                <FaArrowLeft />
                            </button>

                            <div className="relative">
                                <img
                                    src={selectedMatch.avatar}
                                    alt={selectedMatch.name}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-white/10"
                                />
                                {selectedMatch.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                                )}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                    {selectedMatch.name}
                                </h3>
                                <p className={`text-xs font-medium flex items-center gap-1 ${selectedMatch.online
                                    ? 'text-green-400'
                                    : theme === 'light' ? 'text-gray-500' : 'text-white/40'
                                    }`}>
                                    {isTyping ? (
                                        <span className="text-pink-400 animate-pulse">typing...</span>
                                    ) : (
                                        selectedMatch.online ? 'Online' : 'Offline'
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className={`p-3 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}>
                                <FaPhone />
                            </button>
                            <button className={`p-3 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}>
                                <FaVideo />
                            </button>
                            <button className={`p-3 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}>
                                <FaEllipsisV />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide`}>
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <FaHeart className="text-4xl text-pink-500/50" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">It's a Match!</h3>
                                <p className="text-white/60 max-w-xs">
                                    You and {selectedMatch.name} liked each other. <br />
                                    Don't be shy, say hello! 👋
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.senderId === undefined ? true : (msg.senderId._id ? msg.senderId._id !== selectedMatch.userId : msg.senderId !== selectedMatch.userId);
                                // The logic above is tricky because msg.senderId might be populated or not depending on backend.
                                // Let's check api response structure. GET /api/message/conversation returns populated senderId.
                                // If senderId._id === selectedMatch.userId then it is THEM.
                                // Wait, `api/message` POST returns populated senderId. 
                                // `fetchMessages` returns populated.
                                // Let's simplify:
                                // Our ID is difficult to get without context or assumption.
                                // If `senderId._id` equals `selectedMatch.userId`, it's THEM. Otherwise ME.

                                const isSenderMatch = (msg.senderId?._id || msg.senderId) === selectedMatch.userId;

                                return (
                                    <motion.div
                                        key={msg._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-end gap-3 ${!isSenderMatch ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {isSenderMatch && (
                                            <img src={selectedMatch.avatar} alt="" className="w-8 h-8 rounded-full mb-1" />
                                        )}

                                        <div className={`max-w-[80%] md:max-w-[60%] space-y-1 ${!isSenderMatch ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                                            <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-lg relative overflow-hidden
                                                ${!isSenderMatch
                                                    ? 'bg-gradient-to-br from-pink to-pink-2 text-white rounded-tr-none'
                                                    : theme === 'light'
                                                        ? 'bg-white text-burgundy rounded-tl-none border border-pink-100'
                                                        : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}
                                            >
                                                {/* Wavy Background (SVG) for sender */}
                                                {!isSenderMatch && (
                                                    <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                                                        <defs>
                                                            <pattern id="wavy" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                <path d="M0 10 Q 5 5, 10 10 T 20 10" fill="none" stroke="white" strokeWidth="1" />
                                                            </pattern>
                                                        </defs>
                                                        <rect width="100%" height="100%" fill="url(#wavy)" />
                                                    </svg>
                                                )}
                                                <span className="relative z-10">{msg.content}</span>
                                            </div>
                                            <span className={`text-[10px] px-1 ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`}>
                                                {/* Format time properly */}
                                                {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 md:p-6 pb-24 md:pb-6">
                        <div className={`flex items-center gap-3 p-2 pr-2 rounded-full border transition-all
                            ${theme === 'light'
                                ? 'bg-white border-gray-200 focus-within:ring-2 focus-within:ring-pink-100'
                                : 'bg-white/5 border-white/10 focus-within:bg-white/10 focus-within:border-white/20'}`}>

                            <button className={`p-3 rounded-full transition-colors ${theme === 'light' ? 'text-gray-400 hover:text-pink-500' : 'text-white/40 hover:text-pink-400'}`}>
                                <FaImage className="text-xl" />
                            </button>

                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleInput}
                                onKeyPress={handleKeyPress}
                                className={`flex-1 bg-transparent outline-none px-2 ${theme === 'light' ? 'text-gray-800 placeholder-gray-400' : 'text-white placeholder-white/30'}`}
                            />

                            <button className={`p-3 rounded-full transition-colors ${theme === 'light' ? 'text-gray-400 hover:text-pink-500' : 'text-white/40 hover:text-pink-400'}`}>
                                <FaSmile className="text-xl" />
                            </button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                className={`p-3 rounded-full bg-gradient-to-r from-pink to-heart-red text-white shadow-lg shadow-pink/20 
                                    ${!newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-pink/40'}`}
                            >
                                <FaPaperPlane />
                            </motion.button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center flex-col text-center p-8 opacity-50">
                    <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-8 blur-sm">
                        <BsHeartFill className="text-6xl text-pink-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Your Soulmate Awaits
                    </h2>
                    <p className="text-white/60 max-w-md text-lg font-light">
                        Select a conversation from the left to start chatting. <br />
                        Connect deeply, reply authentically.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Soulmate;
