import AnimeStore from "../AnimeStore";
import classNames from "classnames/bind";
import styles from "./Home.module.scss";
import AnimePoster from "~/components/AnimePoster";
import { useEffect, useState } from "react";
import get from "~/services/getService";
import config from "~/config";
import MySwiper from "~/components/MySwiper";
import { Pagination, Scrollbar, Autoplay } from "swiper/modules";
import OptionItem from "~/layouts/components/Header/Options/OptionItem";

const cx = classNames.bind(styles);

function Home() {
    const [newestAnimes, setNewestAnimes] = useState([]);
    const [selectedOption, setSelectedOption] = useState("Tất cả");

    useEffect(() => {
        const fetchApi = async () => {
            const response = await get(config.endpoints.getTopAnimes);
            setNewestAnimes(response.data);
        };

        fetchApi();
    }, []);

    useEffect(() => {
        cutData();
    }, [newestAnimes]);

    // cắt bớt tên, mô tả để không bị quá dài
    const cutData = () => {
        setNewestAnimes((prevAnimes) =>
            prevAnimes.map((item) => ({
                ...item,
                name:
                    item.name.length > 40
                        ? item.name.slice(0, 40) + "..."
                        : item.name,
                description:
                    item.description.length > 145
                        ? item.description.slice(0, 145) + "..."
                        : item.description,
            }))
        );
    };

    const handleOptionClick = (title) => {
        console.log(title);
        setSelectedOption(title);
    };

    return (
        <div>
            <div className={cx("anime-posters", "col-12")}>
                <MySwiper
                    modules={[Pagination, Scrollbar, Autoplay]}
                    slidesPerView={1}
                    autoplay={{
                        delay: 3000, // delay time
                        disableOnInteraction: false, // Tiếp tục autoplay sau khi tương tác
                    }}
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                    loop={true}
                    data={newestAnimes.map((item, index) => (
                        <AnimePoster key={index} data={item} />
                    ))}
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
            <AnimeStore homePageCustom="home-page-custom" />
            {/* custom anime in home page */}
        </div>
    );
}

export default Home;
