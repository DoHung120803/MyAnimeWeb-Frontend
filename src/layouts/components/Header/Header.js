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
import React, { useState } from "react";
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
            <div className={cx("wrapper")}>
                <div className={cx("inner")}>
                    {/* Left Side - Logo */}
                    <div className={cx("logo-container")}>
                        <Link to={config.routes.home} className={cx("logo-link")}>
                            <img
                                src={images.logo}
                                alt="anime-logo"
                                className={cx("anime-logo")}
                            />
                            <span className={cx("anime-text")}>ANIME</span>
                        </Link>
                    </div>

                    {/* Center - Navigation Menu */}
                    <div className={cx("nav-menu")}>
                        <Link to={config.routes.home} className={cx("nav-item", { active: currentUrl === config.routes.home })}>
                            TRANG CHỦ
                        </Link>
                        <Link to="/genre" className={cx("nav-item")}>
                            THỂ LOẠI
                        </Link>
                        <Link to="/status" className={cx("nav-item")}>
                            TRẠNG THÁI
                        </Link>
                        <Link to="/popular" className={cx("nav-item")}>
                            XEM NHIỀU
                        </Link>
                        <Link to="/commented" className={cx("nav-item")}>
                            BÌNH LUẬN NHIỀU
                        </Link>
                        <Link to="/year" className={cx("nav-item")}>
                            NĂM
                        </Link>
                    </div>

                    {/* Right Side - Search & Auth */}
                    <div className={cx("header-right")}>
                        <div className={cx("search-container")}>
                            <Search />
                        </div>
                        
                        <div className={cx("auth-buttons")}>
                            <Button 
                                className={'authLogin'} 
                                leftIcon={<FontAwesomeIcon icon={faRightToBracket} />}
                                onClick={openLoginModal}
                            >
                                Login
                            </Button>

                            <Button 
                                className={'authRegister'} 
                                leftIcon={<FontAwesomeIcon icon={faUserPlus} />}
                                onClick={openRegisterModal}
                            >
                                Register
                            </Button>
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
