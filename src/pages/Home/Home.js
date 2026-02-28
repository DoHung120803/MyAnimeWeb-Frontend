import AnimeStore from "../AnimeStore";
import classNames from "classnames/bind";
import styles from "./Home.module.scss";
import AnimePoster from "~/components/AnimePoster";
import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import get from "~/services/getService";
import config from "~/config";
import MySwiper from "~/components/MySwiper";
import { Pagination, Scrollbar, Autoplay } from "swiper/modules";
import OptionItem from "~/layouts/components/Header/Options/OptionItem";

// Lazy load AnimeStore since it's below the fold
const LazyAnimeStore = lazy(() => import("../AnimeStore"));

const cx = classNames.bind(styles);

function Home() {
    const [newestAnimes, setNewestAnimes] = useState([]);
    const [selectedOption, setSelectedOption] = useState("Tất cả");

    useEffect(() => {
        const fetchApi = async () => {
            const response = await get(config.endpoints.getTopAnimes);
            // Cắt bớt tên, mô tả ngay khi nhận data để tránh infinite loop
            const processed = response.data.map((item) => ({
                ...item,
                name:
                    item.name.length > 40
                        ? item.name.slice(0, 40) + "..."
                        : item.name,
                description:
                    item.description.length > 145
                        ? item.description.slice(0, 145) + "..."
                        : item.description,
            }));
            setNewestAnimes(processed);
        };

        fetchApi();
    }, []);

    // Memoize swiper data to prevent re-creating on each render
    const swiperData = useMemo(
        () => newestAnimes.map((item, index) => <AnimePoster key={index} data={item} />),
        [newestAnimes]
    );

    const handleOptionClick = (title) => {
        setSelectedOption(title);
    };

    return (
        <div>
            <div className={cx("anime-posters", "col-12")}>
                <MySwiper
                    modules={[Pagination, Scrollbar, Autoplay]}
                    slidesPerView={1}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                    loop={true}
                    data={swiperData}
                />
            </div>
            <div className={cx("list-block", "col-12 row")}>
                <h2
                    className={cx(
                        "lb-title",
                        "col-3 d-flex justify-content-center align-items-center"
                    )}
                >
                    DANH SÁCH PHIM
                    <i class="fa fa-angle-right"></i>
                </h2>
                <div className="col-9">
                    {[
                        "Tất cả",
                        "Đang hot",
                        "Mùa này",
                        "Năm nay",
                        "Anime bộ",
                    ].map((title) => (
                        <OptionItem
                            key={title}
                            className={cx("option", {
                                "option-selected": selectedOption === title,
                            })}
                            title={title}
                            onClick={() => handleOptionClick(title)}
                        />
                    ))}
                </div>
            </div>
            <Suspense fallback={<div style={{ minHeight: 400 }} />}>
                <LazyAnimeStore homePageCustom="home-page-custom" />
            </Suspense>
            {/* custom anime in home page */}
        </div>
    );
}

export default Home;
