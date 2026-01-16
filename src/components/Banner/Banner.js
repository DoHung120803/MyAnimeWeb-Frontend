import classNames from "classnames/bind";
import styles from "./Banner.module.scss";
import AnimePoster from "../AnimePoster";
import { useEffect, useState } from "react";
import get from "~/services/getService";
import config from "~/config";
import MySwiper from "../MySwiper";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

const cx = classNames.bind(styles);

function Banner() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fallback banner data
    const fallbackBanners = [
        {
            id: 1,
            name: "Attack on Titan",
            thumbnailUrl: "https://via.placeholder.com/1200x600/1a1a2e/ffffff?text=Attack+on+Titan",
            description: "Humanity fights for survival against giant titans",
            views: "2.5M"
        },
        {
            id: 2,
            name: "Demon Slayer",
            thumbnailUrl: "https://via.placeholder.com/1200x600/16213e/ffffff?text=Demon+Slayer",
            description: "A young boy becomes a demon slayer to save his sister",
            views: "3.1M"
        },
        {
            id: 3,
            name: "One Piece",
            thumbnailUrl: "https://via.placeholder.com/1200x600/0f3460/ffffff?text=One+Piece",
            description: "Pirates adventure to find the ultimate treasure",
            views: "4.2M"
        }
    ];

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const response = await get(config.endpoints.getBanners);
                
                if (response && response.data && response.data.length > 0) {
                    setBanners(response.data);
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
        <div className={cx("container")}>
            <MySwiper
                modules={[Autoplay, EffectFade]}
                slidesPerView={1}
                speed={2500}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                effect="fade"
                fadeEffect={{
                    crossFade: true,
                }}
                loop={banners.length > 1}
                data={banners.map((banner, index) => (
                    <div key={banner.id} className={cx("slide-container")}>
                        <AnimePoster data={banner} banner={true} />
                        <div className={cx("popular-label")}>
                            POPULAR ANIME
                        </div>
                        <div className={cx("banner-info")}>
                            <div className={cx("anime-title")}>
                                {banner.name}
                            </div>
                            <div className={cx("anime-description")}>
                                {banner.description}
                            </div>
                        </div>
                    </div>
                ))}
            />
        </div>
    );
}

export default Banner;
