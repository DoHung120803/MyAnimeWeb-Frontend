/*
 * display poster for newest anime
 */

import classNames from "classnames/bind";
import styles from "./AnimePoster.module.scss";
import { Link } from "react-router-dom";
import config from "~/config";

const cx = classNames.bind(styles);

function AnimePoster({ data, banner = false, className }) {
    return (
        <div
            className={cx("container", "col-12 h-100", {
                [className]: className,
            })}
        >
            <Link
                to={banner || config.routes.anime.replace(":id", data.id)}
                state={data}
            >
                <div className={cx("background")}></div>
                <img
                    className={cx("thumbnail", "w-100 h-100")}
                    alt="anime thumbnail"
                    src={data.thumbnailUrl || data.imageUrl}
                />
            </Link>

            {banner || (
                <div className={cx("poster-info", "col-7 h-100")}>
                    <Link
                        to={config.routes.anime.replace(":id", data.id)}
                        state={data}
                    >
                        <div className={cx("title")}>{data.name}</div>
                    </Link>
                    <span className={cx("star-icon")}>{data.views}</span>
                    <span className={cx("clock-icon")}>01/09</span>
                    <span className={cx("calender-icon")}>2024</span>
                    <span className={cx("tag")}>HD</span>
                    <span className={cx("tag")}>4K</span>
                    <p>{data.description}</p>
                    <p className={cx("studio")}>
                        <span>Studio: </span>
                        <span className={cx("studio-name")}>
                            Tokyo Animation
                        </span>
                    </p>
                    <p className={cx("genre")}>
                        <span>Thể loại: </span>
                        <span className={cx("genre-name")}>
                            Shounen, Action, Fantasy, Adventure
                        </span>
                    </p>
                    <button
                        type="button"
                        class={cx("action-btn", "btn btn-success")}
                    >
                        Xem phim
                    </button>
                    <button
                        type="button"
                        class={cx("action-btn", "btn btn-danger")}
                    >
                        Yêu thích
                    </button>
                    <button
                        type="button"
                        class={cx("action-btn", "btn btn-primary")}
                    >
                        Share
                    </button>
                </div>
            )}
        </div>
    );
}

export default AnimePoster;
