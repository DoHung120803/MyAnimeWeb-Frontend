import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./GenreCarousel.module.scss";
import React, { useEffect, useState, useRef } from "react";
import getService from "~/services/getService";
import MySwiper from "../MySwiper";
import { A11y, Navigation } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

function GenreCarousel({ title = "Thể loại" }) {
    const [genreList, setGenreList] = useState([]);
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

    useEffect(() => {
        const fetch = async () => {
            const response = await getService("/api/v1/genres");
            setGenreList(response.data);
        };

        fetch();
    }, []);

    const renderGenreCard = (genre, index) => {
        return (
            <Link
                key={genre.id}
                to={genre.slug}
                className={cx("genre-card-link")}
            >
                <div className={cx("genre-card")}>
                    {/* Poster image */}
                    <div className={cx("poster-container")}>
                        <img
                            src={genre.image}
                            alt={genre.name}
                            className={cx("poster-image")}
                            loading="lazy"
                            decoding="async"
                            width={250}
                            height={150}
                        />
                        <div className={cx("poster-overlay")}>
                            <div className={cx("genre-name-overlay")}>
                                {genre.name}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <section className={cx("genre-carousel")}>
            <div className={cx("section-header")}>
                <h2 className={cx("section-title")}>{title}</h2>
                <Link to="/genres" className={cx("view-all")}>
                    Xem tất cả
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
                    data={genreList.map((genre, index) => renderGenreCard(genre, index))}
                    modules={[Navigation, A11y]}
                    spaceBetween={24}
                    slidesPerView={6}
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
                            slidesPerView: 2.5,
                            spaceBetween: 14,
                        },
                        576: {
                            slidesPerView: 3.5,
                            spaceBetween: 18,
                        },
                        768: {
                            slidesPerView: 4.5,
                            spaceBetween: 20,
                        },
                        992: {
                            slidesPerView: 5.5,
                            spaceBetween: 22,
                        },
                        1200: {
                            slidesPerView: 6.5,
                            spaceBetween: 24,
                        },
                        1400: {
                            slidesPerView: 7,
                            spaceBetween: 24,
                        },
                    }}
                />
            </div>
        </section>
    );
}

GenreCarousel.propTypes = {
    title: PropTypes.string,
};

export default GenreCarousel;
