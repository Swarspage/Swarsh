/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHeart, FaSearch, FaPaperPlane, FaPhone, FaVideo, FaEllipsisV,
    FaImage, FaSmile, FaArrowLeft, FaCheckDouble, FaCircle
} from 'react-icons/fa';
import { BsHeartFill, BsEmojiSmile } from 'react-icons/bs';
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
                    lastMessage: "Start a conversation!",
                    time: 'Now',
                    unread: 0,
                    online: false,
                    avatar: avatar
                };
            });
            setMatches(matchesData);
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
        }
    }, [selectedMatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

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
        }
    };

    const filteredMatches = matches.filter(match =>
        match.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Theme Constants matching AccountSetting
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
        // No heavy shadow on full panel usually, but maybe subtle
    };

    const inputClass = `w-full bg-transparent border-none outline-none text-sm font-medium placeholder-opacity-50
    ${isLight ? 'text-[#000407] placeholder-[#000407]' : 'text-white placeholder-white'}`;

    return (
        <div className={`flex h-[calc(100vh-80px)] md:h-screen w-full relative overflow-hidden transition-colors duration-500 font-sans ${pageBg}`}>

            {/* --- LEFT SIDEBAR --- */}
            <div
                className={`w-full md:w-[360px] h-full flex flex-col border-r z-20 transition-all duration-300
                ${selectedMatch ? 'hidden md:flex' : 'flex'}
                ${isLight ? 'border-[#A8A7ED]/20 bg-white/40' : 'border-[#A8A7ED]/10 bg-[#09090F]/40'} backdrop-blur-xl`}
            >
                {/* Header */}
                <div className="p-6 pb-2">
                    <h2 className={`text-2xl font-bold mb-6 ${textPrimary}`}>
                        Messages
                    </h2>

                    {/* Search Bar */}
                    <div className={`flex items-center px-4 py-3 rounded-[16px] transition-all border
                        ${isLight ? 'bg-white/50 border-[#A8A7ED]/20' : 'bg-white/5 border-[#A8A7ED]/10'}`}>
                        <FaSearch className={`${isLight ? 'text-[#000407]/40' : 'text-white/40'}`} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`ml-3 ${inputClass}`}
                        />
                    </div>
                </div>

                {/* Matches List */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                    {filteredMatches.map((match) => {
                        const isSelected = selectedMatch?.id === match.id;
                        return (
                            <div
                                key={match.id}
                                onClick={() => setSelectedMatch(match)}
                                className={`flex items-center gap-4 p-3 rounded-[16px] cursor-pointer transition-all border border-transparent
                                    ${isSelected
                                        ? (isLight ? 'bg-white shadow-sm border-[#A8A7ED]/20' : 'bg-white/10 border-[#A8A7ED]/10')
                                        : 'hover:bg-white/5'}`}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className={`w-12 h-12 rounded-full overflow-hidden border 
                                        ${isLight ? 'border-white' : 'border-white/10'}`}>
                                        <img src={match.avatar} className="w-full h-full object-cover" />
                                    </div>
                                    {match.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#A8A7ED] rounded-full border-2 border-white"></div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`font-bold text-sm truncate ${textPrimary}`}>
                                            {match.name}
                                        </h3>
                                        <span className={`text-[10px] bg-transparent ${textSecondary}`}>{match.time}</span>
                                    </div>
                                    <p className={`text-xs truncate ${textSecondary}`}>
                                        {match.lastMessage}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {filteredMatches.length === 0 && (
                        <div className={`flex flex-col items-center justify-center py-12 opacity-50 ${textSecondary}`}>
                            <p>No matches found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- RIGHT SIDE - CHAT AREA --- */}
            {selectedMatch ? (
                <div className="flex-1 flex flex-col h-full relative z-10">

                    {/* Chat Header */}
                    <div className={`px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl
                        ${isLight ? 'bg-white/30 border-[#A8A7ED]/20' : 'bg-[#09090F]/30 border-[#A8A7ED]/10'}`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedMatch(null)} className={`md:hidden p-2 -ml-2 ${textSecondary}`}>
                                <FaArrowLeft />
                            </button>
                            <div className="relative">
                                <img src={selectedMatch.avatar} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                            </div>
                            <div>
                                <h3 className={`font-bold text-base ${textPrimary}`}>
                                    {selectedMatch.name}
                                </h3>
                                <p className={`text-xs ${textSecondary} flex items-center gap-1.5`}>
                                    {isTyping ? <span className="text-[#A8A7ED] animate-pulse">Typing...</span> : (
                                        selectedMatch.online ?
                                            <span className="text-green-500 flex items-center gap-1"><FaCircle size={6} /> Active</span> :
                                            <span>Offline</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className={`p-2 rounded-full hover:bg-white/10 transition-colors ${textSecondary}`}>
                                <FaEllipsisV size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                <BsHeartFill className={`text-4xl mb-4 text-[#A8A7ED]`} />
                                <p className={`text-sm ${textSecondary}`}>
                                    Say hello to {selectedMatch.name} 👋
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isSenderMatch = msg.senderId?._id === selectedMatch.userId || msg.senderId === selectedMatch.userId;
                                const isMe = !isSenderMatch; // I am the sender if it's NOT the match

                                return (
                                    <div
                                        key={msg._id || index}
                                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isMe && <img src={selectedMatch.avatar} className="w-6 h-6 rounded-full mb-1 opacity-80" />}

                                        <div className={`max-w-[75%] px-4 py-2.5 text-[14px] shadow-sm relative group rounded-[18px]
                                            ${isMe
                                                ? 'bg-[#A8A7ED] text-white rounded-br-[4px]'
                                                : (isLight
                                                    ? 'bg-white text-[#000407] border border-[#A8A7ED]/20 rounded-bl-[4px]'
                                                    : 'bg-white/10 text-white border border-[#A8A7ED]/10 rounded-bl-[4px]')}`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className={`p-4 md:p-6 pb-8 border-t backdrop-blur-xl
                        ${isLight ? 'bg-white/40 border-[#A8A7ED]/20' : 'bg-[#09090F]/40 border-[#A8A7ED]/10'}`}>
                        <div className={`max-w-4xl mx-auto flex items-end gap-2 border rounded-[24px] p-1.5 pr-2 transition-all shadow-sm
                            ${isLight
                                ? 'bg-white/60 border-[#A8A7ED]/20 focus-within:bg-white focus-within:shadow-md'
                                : 'bg-white/5 border-[#A8A7ED]/10 focus-within:bg-white/10'}`}>

                            <textarea
                                value={newMessage}
                                onChange={handleInput}
                                onKeyPress={handleKeyPress}
                                placeholder="Message..."
                                className={`flex-1 bg-transparent border-none outline-none py-2.5 px-3 max-h-32 resize-none text-sm
                                    ${isLight ? 'text-[#000407] placeholder-black/30' : 'text-white placeholder-white/30'}`}
                                rows={1}
                            />

                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-all
                                    ${newMessage.trim()
                                        ? 'bg-[#A8A7ED] hover:opacity-90'
                                        : 'bg-gray-300 dark:bg-white/10 cursor-not-allowed'}`}
                            >
                                <FaPaperPlane size={12} className="-ml-0.5 mt-0.5" />
                            </button>
                        </div>
                    </div>

                </div>
            ) : (
                /* --- EMPTY STATE (Desktop) --- */
                <div className="hidden md:flex flex-1 items-center justify-center flex-col text-center opacity-60">
                    <div className="w-24 h-24 rounded-full bg-[#A8A7ED]/10 flex items-center justify-center mb-4">
                        <BsHeartFill className="text-4xl text-[#A8A7ED]" />
                    </div>
                    <p className={`text-lg font-medium ${textSecondary}`}>
                        Select a conversation
                    </p>
                </div>
            )}
        </div>
    );
};

export default Soulmate;
