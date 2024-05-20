import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./SuggestedAnimes.module.scss";
import AnimeItem from "./AnimeItem";
import { useEffect, useState } from "react";
import * as getTopViewsAnimesService from "~/services/getTopViewsAnimesService";

const cx = classNames.bind(styles);

function SuggestedAccounts({ label }) {
    const [suggestedList, setSuggestedList] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            const data = await getTopViewsAnimesService.get();
            setSuggestedList(data);
        };

        fetch();
    }, []);

    return (
        <div className={cx("wrapper")}>
            <p className={cx("label")}>{label}</p>
            {suggestedList.map((suggestedAnime, index) => {
                return (
                    <AnimeItem
                        key={index}
                        index={index}
                        name={suggestedAnime.name}
                        id={suggestedAnime.id}
                        description={suggestedAnime.description}
                        views={suggestedAnime.views}
                        rate={suggestedAnime.rate}
                        iframe={suggestedAnime.iframe}
                        thumbnailUrl={suggestedAnime.thumbnailUrl}
                    />
                );
            })}

            <p className={cx("more-btn")}>See all</p>
        </div>
    );
}

SuggestedAccounts.propTypes = {
    label: PropTypes.string.isRequired,
};

export default SuggestedAccounts;
