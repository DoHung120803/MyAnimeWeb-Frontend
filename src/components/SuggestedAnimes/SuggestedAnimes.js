import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./SuggestedAnimes.module.scss";
import AnimeItem from "./AnimeItem";

const cx = classNames.bind(styles);

function SuggestedAccounts({ label }) {
    return (
        <div className={cx("wrapper")}>
            <p className={cx("label")}>{label}</p>

            <AnimeItem />
            <AnimeItem />
            <AnimeItem />
            <AnimeItem />
            <AnimeItem />
            <AnimeItem />
            <AnimeItem />

            <p className={cx("more-btn")}>See all</p>
        </div>
    );
}

SuggestedAccounts.propTypes = {
    label: PropTypes.string.isRequired,
};

export default SuggestedAccounts;
