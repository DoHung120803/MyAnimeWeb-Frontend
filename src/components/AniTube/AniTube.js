import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./AniTube.module.scss";
import aniTubeService from "~/services/aniTubeService";
import AniTubeModal from "./AniTubeModal";
import MySwiper from "~/components/MySwiper";
import { Navigation, A11y } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faChevronLeft,
    faChevronRight,
    faBolt,
} from "@fortawesome/free-solid-svg-icons";
import {
    faTiktok,
    faYoutube,
    faFacebookF,
} from "@fortawesome/free-brands-svg-icons";

const cx = classNames.bind(styles);

const PROVIDERS = [
    { key: "TIKTOK", name: "TikTok", icon: faTiktok },
    { key: "YOUTUBE", name: "YouTube Shorts", icon: faYoutube },
    { key: "FACEBOOK", name: "Facebook Reels", icon: faFacebookF },
];

function AniTube() {
    const [selectedProvider, setSelectedProvider] = useState("TIKTOK");
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeModalIndex, setActiveModalIndex] = useState(null);

    const [swiperInstance, setSwiperInstance] = useState(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        const fetchHomeVideos = async () => {
            setLoading(true);
            try {
                const res = await aniTubeService.getEmbeddedVideos({
                    provider: selectedProvider,
                    context: "home",
                });
                if (isMounted) {
                    const data = Array.isArray(res.data) ? res.data : [];
                    setVideos(data);
                }
            } catch (err) {
                console.error("Error loading home videos for AniTube:", err);
                if (isMounted) {
                    setVideos([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchHomeVideos();

        return () => {
            isMounted = false;
        };
    }, [selectedProvider]);

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

    const handleCardClick = (index) => {
        setActiveModalIndex(index);
    };

    const renderCard = (item, index) => {
        const id = item.id || item.videoId;
        // Poster / thumbnail fallback if any, or modern gradient card with TikTok logo and video ID
        return (
            <div
                key={id || index}
                className={cx("video-card")}
                onClick={() => handleCardClick(index)}
            >
                <div className={cx("card-media")}>
                    {/* Placeholder or embed iframe */}
                    <div className={cx("video-preview-bg")}>
                        <div className={cx("preview-icon")}>
                            {selectedProvider === "TIKTOK" && <FontAwesomeIcon icon={faTiktok} />}
                            {selectedProvider === "YOUTUBE" && <FontAwesomeIcon icon={faYoutube} />}
                            {selectedProvider === "FACEBOOK" && <FontAwesomeIcon icon={faFacebookF} />}
                        </div>
                        <span className={cx("preview-id")}>#{id}</span>
                    </div>

                    <div className={cx("card-overlay")}>
                        <div className={cx("play-icon-box")}>
                            <FontAwesomeIcon icon={faPlay} />
                        </div>
                    </div>
                </div>
                <div className={cx("card-info")}>
                    <div className={cx("title-row")}>
                        <span className={cx("badge-live")}>
                            <FontAwesomeIcon icon={faBolt} /> Short
                        </span>
                        <span className={cx("provider-tag")}>{selectedProvider}</span>
                    </div>
                    <p className={cx("video-id-text")}>Video {index + 1}</p>
                </div>
            </div>
        );
    };

    return (
        <section className={cx("anitube-section")}>
            <div className={cx("section-header")}>
                <div className={cx("title-area")}>
                    <div className={cx("title-glow")}></div>
                    <h2 className={cx("section-title")}>
                        <span className={cx("ani-highlight")}>Ani</span>Tube
                    </h2>
                    <span className={cx("subtitle")}>Video ngắn thịnh hành</span>
                </div>

                {/* Tabs filter provider */}
                <div className={cx("provider-tabs")}>
                    {PROVIDERS.map((p) => (
                        <button
                            key={p.key}
                            className={cx("provider-tab", { active: selectedProvider === p.key })}
                            onClick={() => setSelectedProvider(p.key)}
                        >
                            <FontAwesomeIcon icon={p.icon} className={cx("tab-icon")} />
                            <span>{p.name}</span>
                        </button>
                    ))}
                </div>
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

                {loading ? (
                    <div className={cx("skeleton-loading")}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={cx("skeleton-card")} />
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className={cx("empty-state")}>
                        Chưa có video nào từ {selectedProvider}
                    </div>
                ) : (
                    <MySwiper
                        data={videos.map((item, index) => renderCard(item, index))}
                        modules={[Navigation, A11y]}
                        spaceBetween={18}
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
                                slidesPerView: 2,
                                spaceBetween: 10,
                            },
                            576: {
                                slidesPerView: 3,
                                spaceBetween: 12,
                            },
                            768: {
                                slidesPerView: 4,
                                spaceBetween: 14,
                            },
                            1024: {
                                slidesPerView: 5,
                                spaceBetween: 16,
                            },
                            1400: {
                                slidesPerView: 6,
                                spaceBetween: 18,
                            },
                        }}
                    />
                )}
            </div>

            {/* Modal Detail Video Player */}
            {activeModalIndex !== null && (
                <AniTubeModal
                    initialVideos={videos}
                    initialIndex={activeModalIndex}
                    provider={selectedProvider}
                    onClose={() => setActiveModalIndex(null)}
                />
            )}
        </section>
    );
}

export default AniTube;
