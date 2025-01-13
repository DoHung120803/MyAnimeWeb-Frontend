import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./MySwiper.scss";
import "swiper/css/autoplay";

const MySwiper = ({ data = [], ...props }) => {
    return (
        <Swiper className="h-100" {...props}>
            {data.map((item, index) => (
                <SwiperSlide key={index}>{item}</SwiperSlide>
            ))}
        </Swiper>
    );
};

export default MySwiper;
