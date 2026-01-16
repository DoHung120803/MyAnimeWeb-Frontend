import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./SuggestedAnimes.module.scss";
import AnimeItem from "./AnimeItem";
import React, { useEffect, useState, useRef } from "react";
import * as getTopAnimesService from "~/services/getTopAnimesService";
import MySwiper from "../MySwiper";
import { Scrollbar, A11y, Navigation } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faChevronRight, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

function SuggestedAnimes({ getBy, custom = false, title = "Top Anime", sidebarMode = false }) {
    const [suggestedList, setSuggestedList] = useState([]);
    const [swiperInstance, setSwiperInstance] = useState(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    // Handle navigation clicks
    const handlePrev = () => {
        if (swiperInstance) {
            swiperInstance.slidePrev();
        }
    };

    const handleNext = () => {
        if (swiperInstance) {
            swiperInstance.slideNext();
        }
    };

    useEffect(() => {
        const fetch = async () => {
            const response = await getTopAnimesService.get(getBy);
            setSuggestedList(
                response.data.map((suggestedAnime, index) => {
                    return (
                        <AnimeItem
                            custom={custom}
                            sidebarMode={sidebarMode}
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
                })
            );
        };

        fetch();
    }, [getBy, custom, sidebarMode]);

    return (
        <div className={cx("container", { custom: custom, "sidebar-mode": sidebarMode })}>
            {custom && (
                <div className={cx("section-header")}>
                    <div className={cx("section-title")}>
                        <FontAwesomeIcon className={cx("title-icon")} icon={faFire} />
                        <h2>{title}</h2>
                    </div>
                    <Link to="/anime-store" className={cx("view-all")}>
                        Xem tất cả
                        <FontAwesomeIcon icon={faChevronRight} />
                    </Link>
                </div>
            )}
            <div className={cx("list")}>
                {custom && (
                    <>
                        <button 
                            ref={prevRef} 
                            className={cx("nav-btn", "nav-prev")}
                            onClick={handlePrev}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button 
                            ref={nextRef} 
                            className={cx("nav-btn", "nav-next")}
                            onClick={handleNext}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </>
                )}
                {custom ? (
                    <MySwiper
                        data={suggestedList}
                        modules={[Navigation, Scrollbar, A11y]}
                        spaceBetween={15}
                        slidesPerView={6}
                        onSwiper={setSwiperInstance}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        onBeforeInit={(swiper) => {
                            swiper.params.navigation.prevEl = prevRef.current;
                            swiper.params.navigation.nextEl = nextRef.current;
                        }}
                        loop={true}
                        breakpoints={{
                            320: {
                                slidesPerView: 2,
                                spaceBetween: 10,
                            },
                            576: {
                                slidesPerView: 3,
                                spaceBetween: 10,
                            },
                            768: {
                                slidesPerView: 4,
                                spaceBetween: 12,
                            },
                            992: {
                                slidesPerView: 5,
                                spaceBetween: 15,
                            },
                            1200: {
                                slidesPerView: 6,
                                spaceBetween: 15,
                            },
                        }}
                    />
                ) : (
                    suggestedList
                )}
            </div>
        </div>
    );
}

SuggestedAnimes.propTypes = {
    getBy: PropTypes.string.isRequired,
    title: PropTypes.string,
};

export default SuggestedAnimes;
