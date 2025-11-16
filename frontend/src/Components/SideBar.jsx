// SideBar.jsx
import React from "react";
import { useState } from "react";

import SideItem from "./SideItem";
import ProfileModal from "./ProfileModal";

export default function SideBar({ user, isMenuOpen = false, setIsMenuOpen, isMobile = false }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleOverlayClick = () => {
        if (setIsMenuOpen) {
            setIsMenuOpen(false);
        }
    };

    const sidebarClasses = isMobile 
        ? `side-nav fixed z-50 h-screen w-60 bg-white pt-32 pb-8 transition-transform duration-300 ease-in-out overflow-y-auto ${
            isMenuOpen ? 'transform translate-x-0' : 'transform -translate-x-full'
        }` 
        : 'side-nav fixed z-20 h-screen pb-50 overflow-y-auto';
    
    const sidebarStyle = isMobile ? {
        position: 'fixed',
        top: 0,
        left: 0,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
        maxHeight: '100vh'
    } : {
        maxHeight: '100vh'
    };

    return (
        <>
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
            
            {/* Mobile overlay */}
            {isMobile && isMenuOpen && (
                <div 
                    className="fixed inset-0 z-30"
                    onClick={handleOverlayClick}
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 30
                    }}
                ></div>
            )}
            
            <div className={sidebarClasses} style={sidebarStyle}>
                <SideItem
                    href="/"
                    iconClass="home-button"
                    label="Home"
                    isActive={false}
                />

                {(user?.role == "supervisor" || user?.role == "head") && <SideItem
                    href="/statistics"
                    iconClass="statistics-button"
                    label="Statistics"
                    isActive={false}
                />}

                {(user?.role == "head") && <SideItem
                    href="/spu"
                    iconClass="spu-button"
                    label="SPU's"
                    isActive={false}
                />}

                {(user?.role == "supervisor" || user?.role == "head") && <SideItem
                    href="/case"
                    iconClass="case-button"
                    label="Cases"
                    isActive={false}
                />}

                {(user?.role == "supervisor" || user?.role == "head") && <SideItem
                    href="/archive"
                    iconClass="archive-button"
                    label="Archive"
                    isActive={false}
                />}

                {(user?._id) && <SideItem
                    href={`/profile/${user._id}`}
                    iconClass="identifying-button"
                    label="Profile"
                    isActive={false}
                />}
            </div>
        </>
    );
}
