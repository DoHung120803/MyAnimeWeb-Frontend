import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";
import SuggestedAnimes from "~/components/SuggestedAnimes";
import HotNewsPlayer from "~/components/HotNewsPlayer/HotNewsPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faFire, faEye, faStar, faTimes } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

function Sidebar() {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    const handleOpenVideoModal = () => {
        setIsVideoModalOpen(true);
    };

    const handleCloseVideoModal = () => {
        setIsVideoModalOpen(false);
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isVideoModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isVideoModalOpen]);

    return (
        <aside className={cx("wrapper")}>
            {/* Featured Highlight Card */}
            <div className={cx("featured-section")}>
                <div className={cx("section-label")}>
                    <FontAwesomeIcon icon={faCrown} className={cx("label-icon")} />
                    <span className={cx("label-text")}>FEATURED</span>
                </div>
                
                <div className={cx("featured-card")}>
                    <div className={cx("featured-thumbnail")} onClick={handleOpenVideoModal}>
                        <HotNewsPlayer />
                        <div className={cx("gradient-overlay")}></div>
                        <div className={cx("badge-container")}>
                            <div className={cx("badge", "trending")}>
                                <FontAwesomeIcon icon={faFire} />
                                <span>Trending</span>
                            </div>
                        </div>
                    </div>
                    <div className={cx("featured-info")}>
                        <h3 className={cx("featured-title")}>Anime Highlights 2026</h3>
                        <div className={cx("featured-meta")}>
                            <div className={cx("meta-item")}>
                                <FontAwesomeIcon icon={faEye} />
                                <span>2.5M views</span>
                            </div>
                            <div className={cx("meta-item")}>
                                <FontAwesomeIcon icon={faStar} />
                                <span>9.8</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className={cx("divider")}></div>

            {/* Top Rankings Section */}
            <div className={cx("ranking-section")}>
                <div className={cx("section-label")}>
                    <FontAwesomeIcon icon={faFire} className={cx("label-icon", "fire")} />
                    <span>SUGGESTED ANIME</span>
                    <div className={cx("sublabel")}>Popular Today</div>
                </div>
                
                <div className={cx("ranking-list")}>
                    <SuggestedAnimes 
                        getBy="api/v1/animes/top-animes" 
                        sidebarMode={true}
                    />
                </div>
            </div>

            {/* Video Modal Fullscreen - Rendered via Portal */}
            {isVideoModalOpen && createPortal(
                <div className={cx("video-modal")} onClick={handleCloseVideoModal}>
                    <div className={cx("modal-content")} onClick={(e) => e.stopPropagation()}>
                        <button className={cx("close-btn")} onClick={handleCloseVideoModal}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className={cx("modal-video-wrapper")}>
                            <HotNewsPlayer showControls={true} />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </aside>
    );
}

export default Sidebar;
