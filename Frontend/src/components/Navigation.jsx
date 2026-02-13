import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dock from './Dock';
import { VscHome, VscHeart, VscAccount, VscSettingsGear } from 'react-icons/vsc';

const Navigation = ({ theme, currentPage }) => {
    const navigate = useNavigate();

    const items = [
        {
            icon: <VscHome size={24} className="text-white" />,
            label: 'Home',
            onClick: () => navigate('/explore')
        },
        {
            icon: <VscHeart size={24} className="text-white" />,
            label: 'Soulmate',
            onClick: () => navigate('/soulmate')
        },
        {
            icon: <VscAccount size={24} className="text-white" />,
            label: 'Profile',
            onClick: () => navigate('/profile')
        },
        {
            icon: <VscSettingsGear size={24} className="text-white" />,
            label: 'Settings',
            onClick: () => navigate('/settings')
        },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Dock
                items={items}
                panelHeight={68}
                baseItemSize={50}
                magnification={70}
            />
        </div>
    );
};

export default Navigation;
