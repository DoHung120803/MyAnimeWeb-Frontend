import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Scrollbar, A11y, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import "swiper/css";
import "./MySwiper.scss";

const MySwiper = ({ data = [] }) => {
    return (
        <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={7}
            slidesPerView={6}
            navigation
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            loop={true}
            className="h-100"
        >
            {data.map((item, index) => (
                <SwiperSlide key={index}>{item}</SwiperSlide>
            ))}
        </Swiper>
    );
};

export default MySwiper;
