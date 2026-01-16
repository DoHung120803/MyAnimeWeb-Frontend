import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./PremiumAnimeCarousel.module.scss";
import React, { useEffect, useState, useRef } from "react";
import * as getTopAnimesService from "~/services/getTopAnimesService";
import MySwiper from "../MySwiper";
import { A11y, Navigation } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronLeft, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import config from "~/config";

const cx = classNames.bind(styles);

function PremiumAnimeCarousel({ getBy, title = "Top Rated Anime" }) {
    const [animeList, setAnimeList] = useState([]);
    const [swiperInstance, setSwiperInstance] = useState(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

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

    const formatViews = (views) => {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + "M";
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + "K";
        }
        return views;
    };

    useEffect(() => {
        const fetch = async () => {
            const response = await getTopAnimesService.get(getBy);
            setAnimeList(response.data);
        };

        fetch();
    }, [getBy]);

    const renderAnimeCard = (anime, index) => {
        return (
            <Link
                key={index}
                to={config.routes.anime.replace(":id", anime.id)}
                state={{
                    id: anime.id,
                    name: anime.name,
                    description: anime.description,
                    iframe: anime.iframe,
                    rate: anime.rate,
                    views: anime.views,
                    thumbnailUrl: anime.thumbnailUrl,
                }}
                className={cx("anime-card-link")}
            >
                <div className={cx("anime-card")}>
                    {/* Ranking indicator */}
                    <div className={cx("rank-strip")}>
                        <span className={cx("rank-number")}>{index + 1}</span>
                    </div>

                    {/* Poster image */}
                    <div className={cx("poster-container")}>
                        <img
                            src={anime.thumbnailUrl}
                            alt={anime.name}
                            className={cx("poster-image")}
                        />
                        <div className={cx("poster-overlay")}>
                            <div className={cx("play-button")}>
                                <FontAwesomeIcon icon={faPlay} />
                            </div>
                        </div>
                    </div>

                    {/* Info panel */}
                    <div className={cx("info-panel")}>
                        <h3 className={cx("anime-title")}>{anime.name}</h3>
                        <div className={cx("meta-row")}>
                            <span className={cx("rating")}>{anime.rate}</span>
                            <span className={cx("views")}>{formatViews(anime.views)} views</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <section className={cx("premium-carousel")}>
            <div className={cx("section-header")}>
                <h2 className={cx("section-title")}>{title}</h2>
                <Link to="/anime-store" className={cx("view-all")}>
                    View All
                    <FontAwesomeIcon icon={faChevronRight} />
                </Link>
            </div>

            <div className={cx("carousel-container")}>
                <button
                    ref={prevRef}
                    className={cx("nav-button", "nav-prev")}
                    onClick={handlePrev}
                    aria-label="Previous"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <button
                    ref={nextRef}
                    className={cx("nav-button", "nav-next")}
                    onClick={handleNext}
                    aria-label="Next"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>

                <MySwiper
                    data={animeList.map((anime, index) => renderAnimeCard(anime, index))}
                    modules={[Navigation, A11y]}
                    spaceBetween={16}
                    slidesPerView={5}
                    slidesPerGroup={1}
                    watchSlidesProgress={true}
                    observer={true}
                    observeParents={true}
                    onSwiper={setSwiperInstance}
                    navigation={{
                        prevEl: prevRef.current,
                        nextEl: nextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                        swiper.params.navigation.prevEl = prevRef.current;
                        swiper.params.navigation.nextEl = nextRef.current;
                    }}
                    loop={false}
                    breakpoints={{
                        320: {
                            slidesPerView: 1.5,
                            spaceBetween: 12,
                        },
                        576: {
                            slidesPerView: 2,
                            spaceBetween: 14,
                        },
                        768: {
                            slidesPerView: 2.5,
                            spaceBetween: 16,
                        },
                        992: {
                            slidesPerView: 3,
                            spaceBetween: 16,
                        },
                        1200: {
                            slidesPerView: 5,
                            spaceBetween: 16,
                        },
                        1400: {
                            slidesPerView: 5,
                            spaceBetween: 16,
                        },
                    }}
                />
            </div>
        </section>
    );
}

PremiumAnimeCarousel.propTypes = {
    getBy: PropTypes.string.isRequired,
    title: PropTypes.string,
};

export default PremiumAnimeCarousel;
