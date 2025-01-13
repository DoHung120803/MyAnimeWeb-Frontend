import React, { useEffect, useRef } from "react";
import hotNewsPlayerSrc from "~/assets/videos/cktg.mp4";
import classNames from "classnames/bind";
import styles from "./HotNewsPlayer.module.scss";

const cx = classNames.bind(styles);

function HotNewsPlayer() {
    const videoRef = useRef();

    return (
        <div className={cx("container", "col-12")}>
            <video
                ref={videoRef}
                className={cx("video", "col-12")}
                controls
                autoPlay
                muted
                loop
            >
                <source src={hotNewsPlayerSrc} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

export default HotNewsPlayer;
