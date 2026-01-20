import React, { useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./HotNewsPlayer.module.scss";

const cx = classNames.bind(styles);

function HotNewsPlayer({ showControls = false }) {
    const videoRef = useRef();
    const hotNewsPlayerSrc = "https://res.cloudinary.com/dqbq0mw4s/video/upload/v1768909778/cktg_hmjbug.mp4";

    return (
        <div className={cx("container")}>
            <video
                ref={videoRef}
                className={cx("video")}
                controls={showControls}
                autoPlay
                muted
                loop
                playsInline
            >
                <source src={hotNewsPlayerSrc} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

export default HotNewsPlayer;
