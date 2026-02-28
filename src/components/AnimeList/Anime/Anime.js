import classNames from "classnames/bind";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState, memo, useCallback } from "react";

import styles from "../AnimeList.module.scss";
import config from "~/config";
import * as deleteAnimeServices from "~/services/deleteAnimeService";
import * as jqueryUltis from "~/utils/jqueryUltis";
import { StarIcon } from "~/components/Icons";

const cx = classNames.bind(styles);

function Anime({
    id,
    name,
    description,
    thumbnailUrl,
    rate,
    views,
    iframe,
    homePageCustom = false,
    isHot = false,
    isNew = false,
    ranking = null,
    episode = null,
}) {
    const navigator = useNavigate();
    const [imageLoaded, setImageLoaded] = useState(false);

    // hàm xử lý xóa anime
    const handleDelete = useCallback(() => {
        deleteAnimeServices.deleteAnime(id);
        jqueryUltis.hiddenAnimeDeteled(id); // ẩn anime khi click xóa
    }, [id]);

    // chuyển hướng sang update
    const handleClickUpdateBtn = useCallback(() => {
        navigator(config.routes.update.replace(":id", id));
    }, [id, navigator]);

    // chuyển hướng sang /animes/:id
    const handleOnClickThumbnail = useCallback(() => {
        navigator(config.routes.anime.replace(":id", id), {
            state: { name, description, thumbnailUrl, rate, views, iframe },
        });
    }, [id, name, description, thumbnailUrl, rate, views, iframe, navigator]);

    return (
        <div className={cx("anime-container")} id={id}>
            <div className={cx("anime-card")} onClick={handleOnClickThumbnail}>
                {/* Image Container with Overlay */}
                <div className={cx("image-wrapper")}>
                    {/* Skeleton Loading */}
                    {!imageLoaded && <div className={cx("image-skeleton")}></div>}
                    
                    <img
                        className={cx("thumbnail", { loaded: imageLoaded })}
                        alt={name}
                        src={thumbnailUrl}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                        decoding="async"
                        width={300}
                        height={420}
                    />

                    {/* Gradient Overlay */}
                    <div className={cx("image-overlay")}></div>

                    {/* Badges */}
                    <div className={cx("badges")}>
                        {isHot && (
                            <span className={cx("badge", "badge-hot")}>
                                <i className="fas fa-fire"></i> HOT
                            </span>
                        )}
                        {isNew && (
                            <span className={cx("badge", "badge-new")}>
                                <i className="fas fa-star"></i> NEW
                            </span>
                        )}
                        {episode && (
                            <span className={cx("badge", "badge-episode")}>
                                Tập {episode}
                            </span>
                        )}
                    </div>

                    {/* Ranking Badge */}
                    {ranking && ranking <= 10 && (
                        <div className={cx("ranking-badge")}>
                            <span className={cx("ranking-number")}>
                                {String(ranking).padStart(2, "0")}
                            </span>
                        </div>
                    )}

                    {/* Hover Play Button */}
                    <div className={cx("play-overlay")}>
                        <div className={cx("play-button")}>
                            <i className="fas fa-play"></i>
                        </div>
                        <p className={cx("play-text")}>Xem ngay</p>
                    </div>
                </div>

                {/* Anime Info */}
                <div className={cx("anime-info")}>
                    <h3 className={cx("anime-name")} title={name}>
                        {name}
                    </h3>

                    <div className={cx("anime-meta")}>
                        {homePageCustom && (
                            <>
                                <div className={cx("meta-item", "meta-rating")}>
                                    <StarIcon width="12" height="12" />
                                    <span>{rate || "N/A"}</span>
                                </div>
                                <div className={cx("meta-item", "meta-views")}>
                                    <i className="fas fa-eye"></i>
                                    <span>{views ? `${(views / 1000).toFixed(1)}K` : "0"}</span>
                                </div>
                            </>
                        )}
                        {!homePageCustom && (
                            <>
                                <p className={cx("rate")}>Rate: {rate}</p>
                                <p className={cx("views")}>Views: {views}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Buttons */}
            <button onClick={handleClickUpdateBtn} className={cx("update-btn")}>
                Sửa
            </button>
            <button onClick={handleDelete} className={cx("delete-btn")}>
                Xóa
            </button>
        </div>
    );
}

Anime.propTypes = {
    name: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
    rate: PropTypes.number,
    views: PropTypes.number,
    isHot: PropTypes.bool,
    isNew: PropTypes.bool,
    ranking: PropTypes.number,
    episode: PropTypes.string,
};

export default memo(Anime);
