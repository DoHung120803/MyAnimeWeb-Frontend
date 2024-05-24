import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./SuggestedAnimes.module.scss";
import AnimeItem from "./AnimeItem";
import React, { useEffect, useRef, useState } from "react";
import * as getTopAnimesService from "~/services/getTopAnimesService";
import { useLocation } from "react-router-dom";

const cx = classNames.bind(styles);

function SuggestedAnimes({ getBy, custom = false }) {
    const [suggestedList, setSuggestedList] = useState([]);
    const suggestedListRef = useRef(null);

    useEffect(() => {
        const fetch = async () => {
            const data = await getTopAnimesService.get(getBy);
            setSuggestedList(data);
        };

        fetch();
    }, []);

    const handleMove = (sign) => {
        // sign = -1 => move right
        // sign = 1 => move left
        const suggestedList = suggestedListRef.current;
        suggestedList.scrollBy({ left: sign * 230, behavior: "smooth" });
    };

    return (
        <div className={cx("container", { custom: custom })}>
            <div ref={suggestedListRef} className={cx("list", {})}>
                {suggestedList.map((suggestedAnime, index) => {
                    return (
                        <AnimeItem
                            custom={custom}
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
            </div>
            {custom && (
                <React.Fragment>
                    <div className={cx("next")} onClick={() => handleMove(1)}>
                        <span className={cx("left-arrow-icon")}></span>
                    </div>
                    <div className={cx("prev")} onClick={() => handleMove(-1)}>
                        <span className={cx("right-arrow-icon")}></span>
                    </div>
                </React.Fragment>
            )}
        </div>
    );
}

SuggestedAnimes.propTypes = {
    getBy: PropTypes.string.isRequired,
};

export default SuggestedAnimes;
