import classNames from "classnames/bind";
import * as httpRequest from "~/utils/httpRequest";
import PropTypes from "prop-types";

import styles from "../AnimeList.module.scss";
import { Link } from "react-router-dom";
import config from "~/config";

const cx = classNames.bind(styles);

function Anime({ id, name, thumbnailUrl, rate, views }) {
    // const handleUpdateAnime = () => {
    //     httpRequest.put(
    //         "http://localhost:8080/myanime/animes/update/7a3b5c04-ef65-4db8-8f56-9f192d892fc2",
    //         {
    //             name: "update anime",
    //             thumbnailUrl: "update",
    //             description: "update",
    //             iframe: "update",
    //         }
    //     );
    // };

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
                <p>Views: {views}</p>
            </div>
            <Link to={config.routes.update.replace(":id", id)}>
                <button className={cx("update-btn")}>Sửa</button>
            </Link>
            <button className={cx("delete-btn")}>Xóa</button>
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
