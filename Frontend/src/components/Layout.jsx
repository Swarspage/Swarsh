import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navigation from './Navigation';
import NotificationToast from './NotificationToast';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark'); // Default to dark for premium feel
    const [socket, setSocket] = useState(null);
    const [toast, setToast] = useState(null);
    const socketRef = useRef(null);

    // Determine current page ID for Navigation
    const getCurrentPageId = () => {
        const path = location.pathname.substring(1); // remove leading slash
        if (path === '') return 'explore'; // default
        return path;
    };

    // Theme effect
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Socket initialization
    useEffect(() => {
        // Only connect if we have a user (which we should in protected routes)
        // For now, we'll assume we are logged in if we are hitting this layout
        // In a real app, we'd check auth context

        socketRef.current = io('http://localhost:5000', {
            withCredentials: true
        });

        socketRef.current.on('connect', () => {
            console.log('Global Socket connected');
        });

        socketRef.current.on('new_match', (data) => {
            setToast({
                type: 'match',
                message: data.message || "You have a new match!",
                duration: 5000
            });
        });

        socketRef.current.on('new_message', (message) => {
            // Only show toast if not currently on the soulmate page (chat)
            if (!location.pathname.includes('/soulmate')) {
                setToast({
                    type: 'message',
                    message: `New message from ${message.senderId?.name || 'someone'}`,
                    duration: 4000
                });
            }
        });

        setSocket(socketRef.current);

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []); // Run once on mount

    return (
        <div className={`min-h-screen w-full flex flex-col transition-colors duration-500
            ${theme === 'light'
                ? 'bg-blush'
                : 'bg-burgundy-dark'}` // Valentine theme bases
        }>
            {/* Background ambiance */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-30
                    ${theme === 'light' ? 'bg-pink-300' : 'bg-pink-900/40'}`} />
                <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-30
                    ${theme === 'light' ? 'bg-purple-300' : 'bg-purple-900/40'}`} />
            </div>

            {/* Global Toast */}
            {toast && (
                <NotificationToast
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Main Content Area */}
            <div className="relative z-10 w-full flex-1 pb-20 md:pb-0 md:pt-24">
                {/* We pass socket and theme down via Outlet context for pages that need it */}
                <Outlet context={{ socket, theme, setTheme }} />
            </div>

            {/* Global Navigation */}
            <Navigation theme={theme} currentPage={getCurrentPageId()} />
        </div>
    );
};

export default Layout;
