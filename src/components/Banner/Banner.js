import classNames from "classnames/bind";
import styles from "./Banner.module.scss";
import AnimePoster from "../AnimePoster";
import { useEffect, useState } from "react";
import get from "~/services/getService";
import config from "~/config";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Thumbs, Navigation } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faHeart, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/thumbs';

const cx = classNames.bind(styles);

function Banner() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [mainSwiper, setMainSwiper] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isManualTransition, setIsManualTransition] = useState(false);

    // Handle manual slide with slide effect
    const handleThumbnailClick = (index) => {
        if (mainSwiper) {
            setIsManualTransition(true);

            // Temporarily disable fade and use slide
            mainSwiper.params.effect = 'slide';
            mainSwiper.params.speed = 400;

            // Update swiper
            mainSwiper.update();
            mainSwiper.slideToLoop(index);

            // Reset to fade after transition and ensure autoplay continues
            setTimeout(() => {
                if (mainSwiper) {
                    mainSwiper.params.effect = 'fade';
                    mainSwiper.params.speed = 1000;
                    mainSwiper.update();

                    // Restart autoplay if it was stopped
                    if (mainSwiper.autoplay && !mainSwiper.autoplay.running) {
                        mainSwiper.autoplay.start();
                    }

                    setIsManualTransition(false);
                }
            }, 500);
        }
    };

    useEffect(() => {
        // Fallback banner data with real anime images
        const fallbackBanners = [
            {
                id: 1,
                name: "Chú Thuật Hồi Chiến",
                englishName: "Jujutsu Kaisen",
                thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop",
                imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop",
                description: "Trò chơi sinh tử do Kenjaku tạo ra nhằm thúc đẩy sự tiến hóa của chú thuật. Yuji Itadori cùng các đồng đội buộc phải tham gia để cứu những người vô tội bị kéo vào cuộc chiến. Mỗi khu vực trở thành một đấu trường tàn khốc, nơi các chú thuật sư phải chiến đấu và tích lũy điểm để tồn tại theo luật Culling Game.",
                views: "2.5M",
                rating: "8.5",
                year: "2020",
                season: "Phần 3",
                episodes: "Tập 3",
                genres: ["Hành Động", "Anime", "Hoạt Hình", "Kỳ Ảo"]
            },
            {
                id: 2,
                name: "Tiếng Yêu Này, Anh Dịch Được Không?",
                englishName: "Can This Love Be Translated?",
                thumbnailUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1920&h=1080&fit=crop",
                imageUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1920&h=1080&fit=crop",
                description: "Đi khắp thế giới để quay chương trình truyền hình, cảm xúc của một người nổi tiếng và phiên dịch viên của cô lại chẳng thể nào thông dịch. Liệu tình yêu có tìm được ngôn ngữ riêng?",
                views: "3.1M",
                rating: "7.9",
                year: "2026",
                season: "Phần 1",
                episodes: "Tập 12",
                genres: ["Chính Kịch", "Tình Cảm", "Hài", "Tâm Lý", "Lãng Mạn"]
            },
            {
                id: 3,
                name: "Cậu Bé Mất Tích",
                englishName: "Stranger Things",
                thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
                imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
                description: "Khi một cậu bé mất tích, một thị trấn nhỏ khám phá các thử nghiệm tối mật, sức mạnh siêu nhiên đáng sợ và một cô bé lạ lùng.",
                views: "4.2M",
                rating: "8.6",
                year: "2016",
                season: "Phần 5",
                episodes: "Tập 8",
                genres: ["Chính Kịch", "Hành Động", "Bí Ẩn", "Kỳ Ảo", "Giả Tưởng"]
            }
        ];

        const fetchBanners = async () => {
            try {
                setLoading(true);
                const response = await get(config.endpoints.getBanners);

                if (response && response.data && response.data.length > 0) {
                    // Map API data to match our structure
                    const mappedBanners = response.data.map(banner => ({
                        id: banner.id,
                        name: banner.name || banner.title || "Anime Title",
                        englishName: banner.englishName || banner.originalTitle || "",
                        nameImage: banner.nameImage || "", // Ảnh tên phim
                        thumbnailUrl: banner.thumbnailUrl || banner.image || banner.poster || banner.imageUrl || "",
                        imageUrl: banner.imageUrl || banner.thumbnailUrl || banner.image || banner.poster || "",
                        description: banner.description || banner.synopsis || "Nội dung đang cập nhật...",
                        views: banner.views || "0",
                        rating: banner.rating || banner.imdb || "N/A",
                        year: banner.year || new Date().getFullYear().toString(),
                        season: banner.season || "Phần 1",
                        episodes: banner.episodes || banner.totalEpisodes ? `Tập ${banner.episodes || banner.totalEpisodes}` : "Tập ?",
                        genres: banner.genres || banner.categories || []
                    }));
                    setBanners(mappedBanners);
                } else {
                    // Use fallback data if API returns empty or no data
                    setBanners(fallbackBanners);
                }
            } catch (error) {
                console.error("Error loading banners:", error);
                // Use fallback data on error
                setBanners(fallbackBanners);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className={cx("container")}>
                <div className={cx("loading")}>
                    <div className={cx("loading-text")}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={cx("container", { "manual-slide": isManualTransition })}>
            {/* Main Banner Swiper */}
            <Swiper
                modules={[Autoplay, EffectFade, Thumbs]}
                slidesPerView={1}
                speed={isManualTransition ? 400 : 1000}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                effect="fade"
                fadeEffect={{
                    crossFade: true,
                }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                loop={banners.length > 1}
                onSwiper={setMainSwiper}
                onSlideChange={(swiper) => {
                    setActiveIndex(swiper.realIndex);
                    // Reset manual transition flag after slide change
                    if (isManualTransition) {
                        setTimeout(() => setIsManualTransition(false), 100);
                    }
                }}
                className={cx("main-swiper")}
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <div className={cx("hero-slide")}>
                            {/* Background Image */}
                            <div className={cx("hero-background")}>
                                <img
                                    src={banner.imageUrl || banner.thumbnailUrl}
                                    alt={banner.name}
                                    className={cx("hero-bg-img")}
                                />
                            </div>

                            {/* Hero Content - Left Aligned */}
                            <div className={cx("hero-content")}>
                                <div className={cx("hero-content-inner")}>
                                    {/* Name Image - Hiển thị ảnh tên phim nếu có */}
                                    {banner.nameImage && (
                                        <div className={cx("hero-name-image")}>
                                            <img
                                                src={banner.nameImage}
                                                alt={banner.name}
                                                className={cx("name-img")}
                                            />
                                        </div>
                                    )}

                                    {/* Main Title - Hiển thị với font nhỏ hơn khi có nameImage */}
                                    <h1 className={cx("hero-subtitle", { "has-name-image": banner.nameImage })}>
                                        {banner.name}
                                    </h1>

                                    {/* Subtitle/English Title */}

                                    <p className={cx("hero-subtitle")}>
                                        {banner.englishName}
                                    </p>


                                    {/* Metadata Row */}
                                    <div className={cx("hero-metadata")}>
                                        {banner.rating && (
                                            <span className={cx("metadata-badge", "rating")}>
                                                {banner.rating}
                                            </span>
                                        )}
                                        {banner.year && (
                                            <span className={cx("metadata-item")}>{banner.year}</span>
                                        )}
                                        {banner.season && (
                                            <span className={cx("metadata-item")}>{banner.season}</span>
                                        )}
                                        {banner.episodes && (
                                            <span className={cx("metadata-item")}>{banner.episodes}</span>
                                        )}
                                    </div>

                                    {/* Genre Tags */}
                                    {banner.genres && banner.genres.length > 0 && (
                                        <div className={cx("hero-genres")}>
                                            {banner.genres.slice(0, 5).map((genre, index) => (
                                                <span key={index} className={cx("genre-tag")}>
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Category List - Above Synopsis */}
                                    <div className={cx("hero-categories")}>
                                        <span className={cx("category-label")}>Thể loại:</span>
                                        <div className={cx("category-list")}>
                                            {banner.genres && banner.genres.length > 0 ? (
                                                banner.genres.map((genre, index) => (
                                                    <span key={index}>
                                                        <button className={cx("category-link")} onClick={(e) => e.preventDefault()}>
                                                            {genre}
                                                        </button>
                                                        {index < banner.genres.length - 1 && <span className={cx("category-separator")}> • </span>}
                                                    </span>
                                                ))
                                            ) : (
                                                <>
                                                    <button className={cx("category-link")} onClick={(e) => e.preventDefault()}>Anime</button>
                                                    <span className={cx("category-separator")}> • </span>
                                                    <button className={cx("category-link")} onClick={(e) => e.preventDefault()}>Hành Động</button>
                                                    <span className={cx("category-separator")}> • </span>
                                                    <button className={cx("category-link")} onClick={(e) => e.preventDefault()}>Phiêu Lưu</button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Synopsis */}
                                    <p className={cx("hero-synopsis")}>
                                        {banner.description}
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className={cx("hero-actions")}>
                                        <button className={cx("btn-primary")}>
                                            <FontAwesomeIcon icon={faPlay} />
                                            <span>Xem Ngay</span>
                                        </button>
                                        <button className={cx("btn-secondary")}>
                                            <FontAwesomeIcon icon={faHeart} />
                                        </button>
                                        <button className={cx("btn-secondary")}>
                                            <FontAwesomeIcon icon={faInfoCircle} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Thumbnail Navigation - Horizontal at Bottom Right */}
            <div className={cx("thumbnail-section")}>
                <div className={cx("thumbnail-container")}>
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={cx("thumbnail-item", { active: index === activeIndex })}
                            onClick={() => handleThumbnailClick(index)}
                        >
                            <img
                                src={banner.thumbnailUrl || banner.imageUrl}
                                alt={banner.name}
                                className={cx("thumbnail-img")}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Banner;
