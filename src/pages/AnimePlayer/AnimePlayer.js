import { useLocation } from "react-router-dom";
import classNames from "classnames/bind";

import styles from "./AnimePlayer.module.scss";

const cx = classNames.bind(styles);

function AnimePlayer() {
    const { state } = useLocation();
    const { name, description, iframe, rate, views } = state;

    return (
        <div className={cx("container")}>
            <h2 className={cx("anime-name")}>{name}</h2>
            <iframe
                className={cx("iframe")}
                src={iframe}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen="allowFullScreen"
            ></iframe>
            <div className={cx("conclusion")}>
                <p className={cx("description")}>{description}</p>
                <span className={cx("views")}>Views: {views}</span>
                <span className={cx("rate")}>Rating: {rate} / 10</span>
            </div>
        </div>
    );
}

export default AnimePlayer;
