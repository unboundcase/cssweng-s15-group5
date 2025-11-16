import React from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../Components/SideBar";
import { useState, useEffect } from "react";
import { fetchSession } from "../fetch-connections/account-connection";

export default function Unauthorized({ message = "You do not have permission to enter this page." }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

    const isMobile = windowWidth <= 650;
    const isVerySmall = windowWidth <= 400;

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadSession = async () => {
            const sessionData = await fetchSession();
            setUser(sessionData?.user || null);
        };
        loadSession();
    }, []);

    useEffect(() => {
        document.title = "Unauthorized";
    }, []);

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-60 w-full max-w-[1280px] mx-auto flex justify-between items-center py-5 px-8 bg-white">
                <div className="flex items-center gap-4">
                    {isMobile && (
                        <button 
                            className="side-icon-setup menu-button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                        </button>
                    )}
                    
                    <a href="/" className="main-logo main-logo-text-nav">
                        <div className="main-logo-setup folder-logo"></div>
                        <div className="flex flex-col">
                            {isVerySmall ? (
                                <>
                                    <p className="main-logo-text-nav-sub mb-[-1rem]">Unbound Manila</p>
                                    <p className="main-logo-text-nav">CMS</p>
                                </>
                            ) : (
                                <>
                                    <p className="main-logo-text-nav-sub mb-[-1rem]">Unbound Manila Foundation Inc.</p>
                                    <p className="main-logo-text-nav">Case Management System</p>
                                </>
                            )}
                        </div>
                    </a>
                </div>
            </div>

            <main className="min-h-[calc(100vh-4rem)] w-full flex mt-[9rem]">
                <SideBar 
                    user={user} 
                    isMenuOpen={isMenuOpen} 
                    setIsMenuOpen={setIsMenuOpen}
                    isMobile={isMobile}
                />

                <div className={`flex flex-col w-full gap-15 ${isMobile ? 'ml-0' : 'ml-[15rem]'} justify-center items-center transform -translate-y-1/5 main-content`}>
                    <div className="flex gap-10 items-center justify-center">
                        <div className="main-logo-setup unauthorized-logo !w-[6rem] !h-[8rem]"></div>
                        <h1 className="main-logo-text-nav !text-[4rem] text-center">Unauthorized</h1>
                    </div>
                    <p className="font-label">{message}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="btn-primary font-bold-label"
                    >
                        Go Home
                    </button>
                </div>
            </main>

            <style jsx>{`
                @media (max-width: 650px) {
                    .menu-button {
                        display: block !important;
                    }
                    .main-content {
                        margin-left: 0 !important;
                    }
                }
            `}</style>
        </>
    );
}
