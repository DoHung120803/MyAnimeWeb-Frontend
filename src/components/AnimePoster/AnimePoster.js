/*
 * display poster for newest anime
 */

import classNames from "classnames/bind";
import styles from "./AnimePoster.module.scss";
import { Link } from "react-router-dom";
import config from "~/config";

const cx = classNames.bind(styles);

function AnimePoster({ data, banner = false, className, index = 0 }) {
    const isAboveFold = index === 0;
    return (
        <div
            className={cx("container", "col-12 h-100", {
                [className]: className,
            })}
        >
            <Link
                to={banner || config.routes.anime.replace(":id", data.id)}
                state={data}
                className={cx("image-link")}
            >
                <div className={cx("background-overlay")}></div>
                <img
                    className={cx("thumbnail", "w-100 h-100")}
                    alt="anime thumbnail"
                    src={data.thumbnailUrl || data.imageUrl}
                    loading={isAboveFold ? "eager" : "lazy"}
                    decoding={isAboveFold ? "sync" : "async"}
                    fetchpriority={isAboveFold ? "high" : "low"}
                    width={1920}
                    height={800}
                />
                <div className={cx("image-gradient")}></div>
            </Link>

            {banner || (
                <div className={cx("poster-info", "col-7 h-100")}>
                    <div className={cx("info-content")}>
                        <Link
                            to={config.routes.anime.replace(":id", data.id)}
                            state={data}
                            className={cx("title-link")}
                        >
                            <h1 className={cx("title")}>{data.name}</h1>
                        </Link>
                        
                        <div className={cx("meta-info")}>
                            <span className={cx("meta-item", "star-icon")}>
                                <i className="fas fa-star"></i>
                                {data.views || "N/A"}
                            </span>
                            <span className={cx("meta-item", "clock-icon")}>
                                <i className="fas fa-clock"></i>
                                01/09
                            </span>
                            <span className={cx("meta-item", "calendar-icon")}>
                                <i className="fas fa-calendar"></i>
                                2024
                            </span>
                            <div className={cx("tags")}>
                                <span className={cx("tag", "tag-hd")}>HD</span>
                                <span className={cx("tag", "tag-4k")}>4K</span>
                            </div>
                        </div>

                        <p className={cx("description")}>{data.description}</p>
                        
                        <div className={cx("details")}>
                            <p className={cx("detail-item", "studio")}>
                                <i className="fas fa-video"></i>
                                <span className={cx("label")}>Studio: </span>
                                <span className={cx("value", "studio-name")}>
                                    Tokyo Animation
                                </span>
                            </p>
                            <p className={cx("detail-item", "genre")}>
                                <i className="fas fa-bookmark"></i>
                                <span className={cx("label")}>Thể loại: </span>
                                <span className={cx("value", "genre-name")}>
                                    Shounen, Action, Fantasy, Adventure
                                </span>
                            </p>
                        </div>

                        <div className={cx("action-buttons")}>
                            <button
                                type="button"
                                className={cx("action-btn", "btn-watch")}
                            >
                                <i className="fas fa-play"></i>
                                <span>Xem phim</span>
                            </button>
                            <button
                                type="button"
                                className={cx("action-btn", "btn-favorite")}
                            >
                                <i className="fas fa-heart"></i>
                                <span>Yêu thích</span>
                            </button>
                            <button
                                type="button"
                                className={cx("action-btn", "btn-share")}
                            >
                                <i className="fas fa-share-alt"></i>
                                <span>Chia sẻ</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnimePoster;
