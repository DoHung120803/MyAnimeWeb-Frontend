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
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { Link } from "react-router-dom";
import { faRightToBracket, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
import MessageIcon from "~/components/MessageIcon";
import NotificationIcon from "~/components/NotificationIcon";
import { useAuth } from "~/contexts/AuthContext";

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
    const { user, isAuthenticated, isAdmin, isAuthModalOpen, authModalMode, openAuthModal, closeAuthModal, logout, requireAuth } = useAuth();
    const currentUrl = useLocation().pathname;
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // Detect scroll position - throttled for performance
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 100);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMenuChange = (menuItem) => {
        console.log(menuItem);
    };

    // Đóng user menu khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userMenu = [
        {
            icon: <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>,
            title: "Trang cá nhân",
            to: user ? `/profile/@${user.username}` : "/",
        },
        {
            icon: <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>,
            title: "Cài đặt",
            to: "/settings",
        },
        ...MENU_ITEMS,
        ...(isAdmin ? [{
            icon: <FontAwesomeIcon icon={faShieldHalved}></FontAwesomeIcon>,
            title: "Quản trị",
            to: "/admin",
            separate: true,
        }] : []),
        {
            icon: <FontAwesomeIcon icon={faSignOut}></FontAwesomeIcon>,
            title: "Đăng xuất",
            separate: !isAdmin,
            onClick: () => {
                logout();
                setShowUserMenu(false);
            },
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
                        <span 
                            className={cx("nav-item")} 
                            onClick={() => {
                                if (requireAuth()) {
                                    navigate('/genre');
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            Thể loại
                        </span>
                        <span 
                            className={cx("nav-item")} 
                            onClick={() => {
                                if (requireAuth()) {
                                    navigate('/country');
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            Quốc gia
                        </span>
                        <span 
                            className={cx("nav-item")} 
                            onClick={() => {
                                if (requireAuth()) {
                                    navigate(config.routes.following);
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            Yêu thích
                        </span>
                        <span 
                            className={cx("nav-item")} 
                            onClick={() => {
                                if (requireAuth()) {
                                    navigate('/friends');
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            Bạn bè
                        </span>
                        {/* <Link to="/more" className={cx("nav-item")}>
                            Thêm
                        </Link> */}
                    </div>

                    {/* Center Right - Search Bar */}
                    <div className={cx("search-center")}>
                        <Search isScrolled={isScrolled} />
                    </div>

                    {/* Right Side - Icons & Auth Buttons */}
                    <div className={cx("header-right")}>
                        {/* Message Icon - Chat Realtime (luôn hiện, click cần login) */}
                        <MessageIcon />

                        {/* Notification Icon (luôn hiện, click cần login) */}
                        <NotificationIcon />

                        {/* Language Selector */}
                        <button className={cx("icon-btn", "lang-btn")} aria-label="Language">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        
                        {/* Nếu chưa đăng nhập: hiện nút Đăng nhập / Đăng ký */}
                        {!isAuthenticated ? (
                            <div className={cx("auth-buttons")}>
                                <button 
                                    className={cx("btn-login")}
                                    onClick={() => openAuthModal('login')}
                                >
                                    Đăng nhập
                                </button>

                                <button 
                                    className={cx("btn-register")}
                                    onClick={() => openAuthModal('register')}
                                >
                                    Đăng ký
                                </button>
                            </div>
                        ) : (
                            /* Nếu đã đăng nhập: hiện avatar + user menu */
                            <div className={cx("user-section")} ref={userMenuRef}>
                                <div 
                                    className={cx("user-trigger")}
                                    onClick={() => setShowUserMenu(prev => !prev)}
                                >
                                    <img
                                        className={cx("user-avatar")}
                                        src={user?.avtUrl || images.noImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user?.firstName || '') + ' ' + (user?.lastName || '')) + '&background=667eea&color=fff'}
                                        alt={user?.username || 'User'}
                                    />
                                    <span className={cx("user-name")}>
                                        {user?.firstName || user?.username || 'User'}
                                    </span>
                                    <svg 
                                        className={cx("dropdown-arrow", { open: showUserMenu })} 
                                        width="12" height="12" viewBox="0 0 24 24" 
                                        fill="none" stroke="currentColor"
                                    >
                                        <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>

                                {/* User Dropdown Menu */}
                                {showUserMenu && (
                                    <div className={cx("user-dropdown")}>
                                        {/* User info header */}
                                        <div className={cx("dropdown-header")}>
                                            <img
                                                className={cx("dropdown-avatar")}
                                                src={user?.avtUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user?.firstName || '') + ' ' + (user?.lastName || '')) + '&background=667eea&color=fff'}
                                                alt={user?.username || 'User'}
                                            />
                                            <div className={cx("dropdown-user-info")}>
                                                <span className={cx("dropdown-fullname")}>
                                                    {user?.firstName} {user?.lastName}
                                                </span>
                                                <span className={cx("dropdown-username")}>
                                                    @{user?.username}
                                                </span>
                                                {user?.roles && user.roles.length > 0 && (
                                                    <div className={cx("dropdown-roles")}>
                                                        {user.roles.map(role => (
                                                            <span key={role.name} className={cx("role-badge", role.name.toLowerCase())}>
                                                                {role.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className={cx("dropdown-divider")}></div>

                                        {/* Menu items */}
                                        {userMenu.map((item, index) => (
                                            <React.Fragment key={index}>
                                                {item.separate && <div className={cx("dropdown-divider")}></div>}
                                                {item.to ? (
                                                    <Link 
                                                        to={item.to} 
                                                        className={cx("dropdown-item")}
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <span className={cx("dropdown-item-icon")}>{item.icon}</span>
                                                        <span>{item.title}</span>
                                                    </Link>
                                                ) : (
                                                    <button 
                                                        className={cx("dropdown-item")}
                                                        onClick={() => {
                                                            if (item.onClick) item.onClick();
                                                            setShowUserMenu(false);
                                                        }}
                                                    >
                                                        <span className={cx("dropdown-item-icon")}>{item.icon}</span>
                                                        <span>{item.title}</span>
                                                    </button>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Auth Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={closeAuthModal}
                title={authModalMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            >
                <AuthContainer 
                    initialMode={authModalMode} 
                    onClose={closeAuthModal}
                />
            </AuthModal>
        </React.Fragment>
    );
}

export default Header;