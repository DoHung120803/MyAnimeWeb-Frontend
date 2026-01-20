import classNames from "classnames/bind";
import styles from "./HomeSidebar.module.scss";
import { useMemo, useState } from "react";
import { HomeIcon, LiveIcon, NewsIcon, AnimeListIcon, SearchIcon } from "../Icons/Icons";

const cx = classNames.bind(styles);

function HomeSidebar() {
    // Static demo data
    const quickLinks = useMemo(
        () => [
            { id: "home", label: "Trang chủ", icon: HomeIcon },
            { id: "search", label: "Tìm kiếm phim", icon: SearchIcon },
            { id: "list", label: "Danh sách của tôi", icon: AnimeListIcon },
            { id: "trending", label: "Xu hướng", icon: NewsIcon },
            { id: "top", label: "Đánh giá cao", icon: AnimeListIcon },
            { id: "popular", label: "Phổ biến nhất", icon: HomeIcon },
            { id: "ongoing", label: "Đang phát sóng", icon: LiveIcon },
            { id: "recent", label: "Mới thêm", icon: LiveIcon },
            { id: "favorites", label: "Yêu thích của tôi", icon: HomeIcon },
            { id: "history", label: "Lịch sử xem", icon: SearchIcon },
        ],
        []
    );

    const categories = useMemo(
        () => [
            "Action",
            "Adventure",
            "Comedy",
            "Drama",
            "Fantasy",
            "Horror",
            "Isekai",
            "Mystery",
            "Romance",
            "Sci‑Fi",
            "Slice of Life",
            "Sports",
            "Thriller",
            "Supernatural",
            "Mecha",
            "Historical",
            "Psychological",
            "Military",
            "School",
            "Harem",
            "Ecchi",
            "Shounen",
            "Shoujo",
            "Seinen",
            "Josei",
            "Yaoi",
            "Yuri",
            "Music",
            "Parody",
            "Demon",
            "Magic",
            "Vampire",
            "Game",
            "Martial Arts",
            "Samurai",
            "Space",
            "Police",
            "Cars",
            "Dementia",
            "Kids",
            "Detective",
            "Cyberpunk",
            "Post-Apocalyptic",
            "Reincarnation",
            "Time Travel"
        ],
        []
    );

    // Keep category panel behaviour
    const [showAllCategories, setShowAllCategories] = useState(false);
    const visibleCategories = showAllCategories ? categories : categories.slice(0, 8);

    return (
        <aside className={cx("sidebar")} aria-label="Home quick sidebar">
            <div className={cx("panel", "panel--quick")}>
                <ul className={cx("quick-list")}>
                    {quickLinks.map(({ id, label, icon: Icon }) => (
                        <li key={id} className={cx("quick-item")}>
                            <span className={cx("quick-icon")}>
                                <Icon width="2.4rem" height="2.4rem" />
                            </span>
                            <span className={cx("quick-label")}>{label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={cx("panel", "panel--categories")}>
                <div className={cx("panel-head")}>
                    <div className={cx("panel-title")}>Categories</div>
                    <button
                        type="button"
                        className={cx("panel-toggle")}
                        onClick={() => setShowAllCategories((v) => !v)}
                        aria-expanded={showAllCategories}
                    >
                        {showAllCategories ? "Less" : "More"}
                    </button>
                </div>
                <div className={cx("tag-wrap")}>
                    {visibleCategories.map((c) => (
                        <button key={c} type="button" className={cx("tag")}>
                            {c}
                        </button>
                    ))}
                    {/* {!showAllCategories && categories.length > 8 && (
                        <button type="button" className={cx("tag", "tag--more")} onClick={() => setShowAllCategories(true)}>
                            More
                        </button>
                    )} */}
                </div>
            </div>
        </aside>
    );
}

export default HomeSidebar;

