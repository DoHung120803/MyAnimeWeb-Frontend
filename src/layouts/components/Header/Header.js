import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleQuestion,
    faCoins,
    faEarthAsia,
    faEllipsisVertical,
    faGear,
    faKeyboard,
    faSignOut,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { Link } from "react-router-dom";
import { faRightToBracket, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import config from "~/config";
import Button from "~/components/Button";
import styles from "./Header.module.scss";
import images from "~/assets/images";
import Menu from "~/components/Popper/Menu";
import { AnimeListIcon, UploadIcon } from "~/components/Icons";
import Image from "~/components/Image";
import Search from "../Search";
import { InboxIcon } from "~/components/Icons";
import AuthModal from "~/components/AuthModal";
import AuthContainer from "~/components/AuthContainer";

const cx = classNames.bind(styles);

const MENU_ITEMS = [
    {
        icon: <FontAwesomeIcon icon={faEarthAsia}></FontAwesomeIcon>,
        title: "English",
        children: {
            title: "Language",
            data: [
                {
                    type: "Language",
                    code: "en",
                    title: "English",
                },
                {
                    type: "Language",
                    code: "vi",
                    title: "Tiếng Việt",
                },
            ],
        },
    },
    {
        icon: <FontAwesomeIcon icon={faCircleQuestion}></FontAwesomeIcon>,
        title: "Feedback and help",
        to: "/feedback",
    },
    {
        icon: <FontAwesomeIcon icon={faKeyboard}></FontAwesomeIcon>,
        title: "Keyboard shortcuts",
    },
];

function Header() {
    const currentUser = false;
    const currentUrl = useLocation().pathname;
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' hoặc 'register'
    const [isScrolled, setIsScrolled] = useState(false);

    // Detect scroll position
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 100); // Change threshold as needed
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMenuChange = (menuItem) => {
        console.log(menuItem);
    };

    const openLoginModal = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const openRegisterModal = () => {
        setAuthMode('register');
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const userMenu = [
        {
            icon: <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>,
            title: "View profile",
            to: "/@hoaa",
        },
        {
            icon: <FontAwesomeIcon icon={faCoins}></FontAwesomeIcon>,
            title: "Get coins",
            to: "/coin",
        },
        {
            icon: <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>,
            title: "Settings",
            to: "/settings",
        },
        ...MENU_ITEMS,
        {
            icon: <FontAwesomeIcon icon={faSignOut}></FontAwesomeIcon>,
            title: "Log out",
            to: "/logout",
            separate: true,
        },
    ];

    return (
        <React.Fragment>
            <div className={cx("wrapper", { scrolled: isScrolled })}>
                <div className={cx("inner")}>
                    {/* Left Side - Logo */}
                    <div className={cx("logo-container")}>
                        <Link to={config.routes.home} className={cx("logo-link")}>
                            <img
                                src={images.logo}
                                alt="anime-logo"
                                className={cx("anime-logo")}
                            />
                        </Link>
                    </div>

                    {/* Center Left - Navigation Menu */}
                    <div className={cx("nav-menu")}>
                        <Link to={config.routes.home} className={cx("nav-item", { active: currentUrl === config.routes.home })}>
                            Trang chủ
                        </Link>
                        <Link to="/anime" className={cx("nav-item")}>
                            Phim Anime
                        </Link>
                        <Link to="/genre" className={cx("nav-item")}>
                            Thể loại
                        </Link>
                        <Link to="/country" className={cx("nav-item")}>
                            Quốc gia
                        </Link>
                        <Link to="/genre" className={cx("nav-item")}>
                            Yêu thích
                        </Link>
                        <Link to="/genre" className={cx("nav-item")}>
                            Bạn bè
                        </Link>
                        <Link to="/more" className={cx("nav-item")}>
                            Thêm
                        </Link>
                    </div>

                    {/* Center Right - Search Bar */}
                    <div className={cx("search-center")}>
                        <Search isScrolled={isScrolled} />
                    </div>

                    {/* Right Side - Icons & Auth Buttons */}
                    <div className={cx("header-right")}>
                        {/* Notification Icon */}
                        <button className={cx("icon-btn")} aria-label="Notifications">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        {/* Language Selector */}
                        <button className={cx("icon-btn", "lang-btn")} aria-label="Language">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        
                        <div className={cx("auth-buttons")}>
                            <button 
                                className={cx("btn-login")}
                                onClick={openLoginModal}
                            >
                                Đăng nhập
                            </button>

                            <button 
                                className={cx("btn-register")}
                                onClick={openRegisterModal}
                            >
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Auth Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={closeAuthModal}
                title={authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            >
                <AuthContainer 
                    initialMode={authMode} 
                    onClose={closeAuthModal}
                />
            </AuthModal>
        </React.Fragment>
    );
}

export default Header;
