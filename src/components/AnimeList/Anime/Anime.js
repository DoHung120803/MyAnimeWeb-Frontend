import classNames from "classnames/bind";
import PropTypes from "prop-types";

import styles from "../AnimeList.module.scss";

const cx = classNames.bind(styles);

function Anime({ name, thumbnailUrl, rate, view }) {
    return (
        <div className={cx("anime-container")}>
            <img
                className={cx("thumbnail")}
                alt="thumbnail"
                src={thumbnailUrl}
            ></img>
            <div className={cx("anime-info")}>
                <p className={cx("anime-name")}>{name}</p>
                <p>Rate: {rate}</p>
                <p>Views: {view}</p>
            </div>
            <button className={cx("update-btn")}>Sửa</button>
            <button className={cx("delete-btn")}>Xóa</button>
        </div>
    );
}

Anime.propTypes = {
    name: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
    rate: PropTypes.number,
    view: PropTypes.number,
};

export default Anime;
