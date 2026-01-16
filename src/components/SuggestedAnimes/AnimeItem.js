import Tippy from "@tippyjs/react/headless";

import classNames from "classnames/bind";
import styles from "./SuggestedAnimes.module.scss";
import { Wrapper as PopperWrapper } from "../Popper";
import AnimePreview from "./AnimePreview/AnimePreview";
import { Link } from "react-router-dom";
import config from "~/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faEye } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

function AccountItem({
    index,
    id,
    name,
    description,
    rate,
    views,
    iframe,
    thumbnailUrl,
    custom,
    sidebarMode = false,
}) {
    const renderPreview = (props) => {
        return (
            <div className={cx("preview")} tabIndex="-1" {...props}>
                <PopperWrapper>
                    <AnimePreview />
                </PopperWrapper>
            </div>
        );
    };

    const getRankClass = (idx) => {
        if (idx === 0) return "top-1";
        if (idx === 1) return "top-2";
        if (idx === 2) return "top-3";
        return "";
    };

    const formatViews = (views) => {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + "M";
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + "K";
        }
        return views;
    };

    return (
        <div>
            <Tippy
                visible={false}
                interactive
                delay={[800, 0]}
                offset={[-30, !custom ? 0 : 100]} // nếu có custom thì cho tràn để hidden
                placement="bottom"
                render={renderPreview}
            >
                <Link
                    to={config.routes.anime.replace(":id", id)}
                    state={{
                        id,
                        name,
                        description,
                        iframe,
                        rate,
                        views,
                        thumbnailUrl,
                    }}
                >
                    <div
                        className={cx(
                            "anime-item",
                            index % 2 === 0 && !custom && !sidebarMode && "even",
                            { "sidebar-mode": sidebarMode }
                        )}
                    >
                        {sidebarMode && (
                            <div className={cx("sidebar-rank", getRankClass(index))}>
                                <span className={cx("rank-number")}>#{index + 1}</span>
                            </div>
                        )}
                        {custom && !sidebarMode && (
                            <div className={cx("rank-badge", getRankClass(index))}>
                                {index + 1}
                            </div>
                        )}
                        <img
                            className={cx("thumbnail")}
                            src={thumbnailUrl}
                            alt={name}
                        />
                        {sidebarMode && (
                            <div className={cx("thumbnail-overlay")}>
                                <div className={cx("gradient-fade")}></div>
                            </div>
                        )}
                        {custom && !sidebarMode && <div className={cx("play-overlay")}></div>}
                        <div className={cx("item-info")}>
                            <p className={cx("name")}>
                                <strong>{name}</strong>
                            </p>
                            {sidebarMode ? (
                                <div className={cx("sidebar-meta")}>
                                    <div className={cx("meta-row")}>
                                        <FontAwesomeIcon icon={faEye} className={cx("icon")} />
                                        <span className={cx("views-text")}>{formatViews(views)}</span>
                                    </div>
                                    <div className={cx("meta-row")}>
                                        <FontAwesomeIcon icon={faStar} className={cx("icon", "star")} />
                                        <span className={cx("rate-text")}>{rate}</span>
                                    </div>
                                </div>
                            ) : custom ? (
                                <>
                                    <p className={cx("rate")}>
                                        <FontAwesomeIcon className={cx("star-icon")} icon={faStar} />
                                        <span>{rate} / 10</span>
                                    </p>
                                    <div className={cx("anime-meta")}>
                                        <div className={cx("meta-item")}>
                                            <FontAwesomeIcon icon={faEye} />
                                            <span>{formatViews(views)}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className={cx("views")}>
                                    Lượt xem: <span>{views}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </Link>
            </Tippy>
        </div>
    );
}

export default AccountItem;
