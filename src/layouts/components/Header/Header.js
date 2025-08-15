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

import config from "~/config";
import Button from "~/components/Button";
import styles from "./Header.module.scss";
import images from "~/assets/images";
import Menu from "~/components/Popper/Menu";
import { AnimeListIcon, UploadIcon } from "~/components/Icons";
import Image from "~/components/Image";
import Search from "../Search";
import Options from "./Options";
import { InboxIcon } from "~/components/Icons";
import React from "react";

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
    const currentUser = true;

    const handleMenuChange = (menuItem) => {
        console.log(menuItem);
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
                    <Link to={config.routes.home} className={cx("logo-link")}>
                        <img
                            src={images.logo}
                            alt="anime-logo"
                            className={cx("anime-logo")}
                        ></img>
                    </Link>

                    <Search />

                    <div className={cx("actions")}>
                        {currentUser ? (
                            <>
                                <Tippy
                                    delay={[0, 50]}
                                    content="Upload Anime"
                                    placement="bottom"
                                >
                                    <Link to={config.routes.upload}>
                                        <button className={cx("action-btn")}>
                                            <UploadIcon />
                                        </button>
                                    </Link>
                                </Tippy>
                                <Tippy
                                    delay={[0, 50]}
                                    content="Anime List"
                                    placement="bottom"
                                >
                                    <Link to={config.routes.animes}>
                                        <button className={cx("action-btn")}>
                                            <AnimeListIcon />
                                        </button>
                                    </Link>
                                </Tippy>
                                <Tippy
                                    delay={[0, 50]}
                                    content="Inbox"
                                    placement="bottom"
                                >
                                    <button className={cx("action-btn")}>
                                        <InboxIcon />
                                        <span className={cx("badge")}>12</span>
                                    </button>
                                </Tippy>
                            </>
                        ) : (
                            <>
                                <Button text>Upload</Button>
                                <Button primary>Log in</Button>
                            </>
                        )}

                        <Menu
                            items={currentUser ? userMenu : MENU_ITEMS}
                            onChange={handleMenuChange}
                        >
                            {currentUser ? (
                                <Image
                                    className={cx("user-avatar")}
                                    alt="Nguyen Van A"
                                    src="htps://th.bing.com/th/id/R.122f0b47e6716f6c6f6b4c39def4685f?rik=kXE0BEE3Pm1E%2fg&pid=ImgRaw&r=0"
                                    fallback="https://static.vecteezy.com/system/resources/previews/011/670/054/original/user-working-on-laptop-flat-icon-free-vector.jpg"
                                />
                            ) : (
                                <button className={cx("more-btn")}>
                                    <FontAwesomeIcon
                                        icon={faEllipsisVertical}
                                    ></FontAwesomeIcon>
                                </button>
                            )}
                        </Menu>

                        {/* <Link to={config.routes.login}>
                            <Button dark>Log in</Button>
                        </Link>

                        <Link to={config.routes.register}>
                            <Button dark>Register</Button>
                        </Link> */}
                    </div>
                </div>
            </div>
            <Options />
        </React.Fragment>
    );
}

export default Header;
