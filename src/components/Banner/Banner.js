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

    useEffect(() => {
        const fetch = async () => {
            const response = await get(config.endpoints.getBanners);
            setBanners(response.data);
        };

        fetch();
    }, []);

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
                loop={true}
                data={banners.map((banner) => (
                    <AnimePoster key={banner.id} data={banner} banner={true} />
                ))}
            />
        </div>
    );
}

export default Banner;
