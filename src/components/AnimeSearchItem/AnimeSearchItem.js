import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./AnimeSearchItem.module.scss";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import Image from "~/components/Image";
import config from "~/config";

const cx = classNames.bind(styles);
function AccountItem({ data }) {
    return (
        <Link
            to={config.routes.anime.replace(":id", data.id)}
            className={cx("wrapper")}
        >
            <Image
                className={cx("thumbnail")}
                src={data.thumbnailUrl}
                alt={data.name}
            ></Image>
            <div className={cx("info")}>
                <h4 className={cx("name")}>{data.name}</h4>
                <p className={cx("rate")}>Đánh giá: {data.rate}/10</p>
                <p className={cx("views")}>Lượt xem: {data.views}</p>
            </div>
        </Link>
    );
}

AccountItem.propTypes = {
    data: PropTypes.object.isRequired,
};

export default AccountItem;
