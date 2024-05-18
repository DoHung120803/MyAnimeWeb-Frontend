import classNames from "classnames/bind";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import styles from "../AnimeList.module.scss";
import config from "~/config";
import * as deleteAnimeServices from "~/services/deleteAnimeService";
import * as jqueryUltis from "~/utils/jqueryUltis";

const cx = classNames.bind(styles);

function Anime({ id, name, thumbnailUrl, rate, views }) {
    const handleDelete = () => {
        deleteAnimeServices.deleteAnime(id);
        jqueryUltis.hiddenAnimeDeteled(id);
    };

    return (
        <div className={cx("anime-container")} id={id}>
            <img
                className={cx("thumbnail")}
                alt="thumbnail"
                src={thumbnailUrl}
            ></img>
            <div className={cx("anime-info")}>
                <p className={cx("anime-name")}>{name}</p>
                <p>Rate: {rate}</p>
                <p>Views: {views}</p>
            </div>
            <Link to={config.routes.update.replace(":id", id)}>
                <button className={cx("update-btn")}>Sửa</button>
            </Link>
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
};

export default Anime;
