import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./AniTubeModal.module.scss";
import VideoEmbed from "./VideoEmbed";
import aniTubeService from "~/services/aniTubeService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faChevronUp,
    faChevronDown,
    faHeart,
    faShare,
    faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

function AniTubeModal({ initialVideos = [], initialIndex = 0, onClose, provider = "TIKTOK" }) {
    const [videos, setVideos] = useState(initialVideos);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [loadingMore, setLoadingMore] = useState(false);
    const [liked, setLiked] = useState({});
    const isFetchingRef = useRef(false);

    // Call API with context = detail to fetch more videos
    const fetchDetailVideos = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoadingMore(true);
        try {
            const res = await aniTubeService.getEmbeddedVideos({
                provider,
                context: "detail",
            });
            const newItems = Array.isArray(res.data) ? res.data : [];
            if (newItems.length > 0) {
                setVideos((prev) => {
                    const existingIds = new Set(prev.map((v) => v.id || v.videoId));
                    const filtered = newItems.filter((item) => !existingIds.has(item.id || item.videoId));
                    return [...prev, ...filtered];
                });
            }
        } catch (err) {
            console.error("Failed to fetch detail videos:", err);
        } finally {
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [provider]);

    useEffect(() => {
        // Fetch detail videos immediately when modal opens
        fetchDetailVideos();
    }, [fetchDetailVideos]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => {
            if (prev < videos.length - 1) {
                // If near the end, load more
                if (prev >= videos.length - 3) {
                    fetchDetailVideos();
                }
                return prev + 1;
            }
            return prev;
        });
    }, [videos.length, fetchDetailVideos]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    // Handle Keyboard navigation (ArrowUp, ArrowDown, Escape)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                handleNext();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                handlePrev();
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNext, handlePrev, onClose]);

    const [isHoveringVideo, setIsHoveringVideo] = useState(false);

    // Handle Wheel scroll throttling - only triggers when mouse is outside the video
    const wheelTimeout = useRef(null);
    const handleWheel = (e) => {
        if (isHoveringVideo) return;
        if (wheelTimeout.current) return;
        if (Math.abs(e.deltaY) > 40) {
            if (e.deltaY > 0) {
                handleNext();
            } else {
                handlePrev();
            }
            wheelTimeout.current = setTimeout(() => {
                wheelTimeout.current = null;
            }, 600);
        }
    };

    const toggleLike = (idx) => {
        setLiked((prev) => ({
            ...prev,
            [idx]: !prev[idx],
        }));
    };

    const currentVideo = videos[currentIndex] || {};

    return (
        <div className={cx("modal-overlay")} onWheel={handleWheel}>
            {/* Close Button */}
            <button className={cx("btn-close")} onClick={onClose} aria-label="Close modal">
                <FontAwesomeIcon icon={faXmark} />
            </button>

            {/* Main Stage */}
            <div className={cx("player-container")}>
                <div
                    className={cx("video-wrapper")}
                    onMouseEnter={() => setIsHoveringVideo(true)}
                    onMouseLeave={() => setIsHoveringVideo(false)}
                    onWheel={(e) => e.stopPropagation()}
                >
                    {currentVideo && (
                        <VideoEmbed
                            key={currentVideo.id || currentVideo.videoId || currentIndex}
                            video={{ ...currentVideo, provider }}
                            isDetail={true}
                            isActive={true}
                        />
                    )}
                </div>

                {/* Right side interaction buttons */}
                <div className={cx("action-buttons")}>
                    <button
                        className={cx("action-btn", { active: liked[currentIndex] })}
                        onClick={() => toggleLike(currentIndex)}
                        title="Thích"
                    >
                        <FontAwesomeIcon icon={faHeart} />
                        <span>Thích</span>
                    </button>
                    <button className={cx("action-btn")} title="Bình luận">
                        <FontAwesomeIcon icon={faCommentDots} />
                        <span>Bình luận</span>
                    </button>
                    <button
                        className={cx("action-btn")}
                        onClick={() => {
                            if (navigator.clipboard) {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Đã sao chép liên kết!");
                            }
                        }}
                        title="Chia sẻ"
                    >
                        <FontAwesomeIcon icon={faShare} />
                        <span>Chia sẻ</span>
                    </button>
                </div>
            </div>

            {/* Vertical Navigation Arrows */}
            <div className={cx("nav-controls")}>
                <button
                    className={cx("nav-btn", { disabled: currentIndex === 0 })}
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    aria-label="Previous video"
                >
                    <FontAwesomeIcon icon={faChevronUp} />
                </button>
                <div className={cx("video-counter")}>
                    {currentIndex + 1} / {videos.length}
                </div>
                <button
                    className={cx("nav-btn", { disabled: currentIndex === videos.length - 1 && !loadingMore })}
                    onClick={handleNext}
                    disabled={currentIndex === videos.length - 1 && !loadingMore}
                    aria-label="Next video"
                >
                    <FontAwesomeIcon icon={faChevronDown} />
                </button>
            </div>
        </div>
    );
}

AniTubeModal.propTypes = {
    initialVideos: PropTypes.array,
    initialIndex: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    provider: PropTypes.string,
};

export default AniTubeModal;
