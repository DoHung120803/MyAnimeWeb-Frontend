import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Header from "../components/Header";
import styles from "./DefaultLayout.module.scss";
import config from "~/config";

// Lazy load below-the-fold and non-critical components
const Sidebar = lazy(() => import("~/layouts/components/Sidebar"));
const Banner = lazy(() => import("~/components/Banner"));
const PremiumAnimeCarousel = lazy(() => import("~/components/PremiumAnimeCarousel"));
const GenreCarousel = lazy(() => import("~/components/GenreCarousel"));
const ChatBoxContainer = lazy(() => import("~/components/ChatBoxContainer"));
const FriendsList = lazy(() => import("~/components/FriendsList"));

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
    const currentUrl = useLocation().pathname;
    const isHome = config.routes.home === currentUrl;

    return (
        <div className={cx("wrapper")}>
            <Header />
            {isHome && (
                <Suspense fallback={<div className={cx("banner-section")} style={{ minHeight: "70vh", background: "#0F0F0F" }} />}>
                    <div className={cx("banner-section")}> 
                        <Banner />
                    </div>
                </Suspense>
            )}
            {isHome && (
                <Suspense fallback={<div style={{ minHeight: 200 }} />}>
                    <GenreCarousel 
                        title="Thể loại"
                    />
                </Suspense>
            )}
            {isHome && (
                <Suspense fallback={<div style={{ minHeight: 300 }} />}>
                    <PremiumAnimeCarousel 
                        getBy="api/v1/animes/top-animes" 
                        title="Top đánh giá cao"
                    />
                </Suspense>
            )}
            <div className={cx("container")}>
                <Suspense fallback={<div style={{ width: "var(--sidebar-left-width)" }} />}>
                    <Sidebar />
                </Suspense>
                <div className={cx("content")}>{children}</div>
                <Suspense fallback={null}>
                    <FriendsList />
                </Suspense>
            </div>
            
            {/* Chat boxes container - hiển thị ở bottom-right */}
            <Suspense fallback={null}>
                <ChatBoxContainer />
            </Suspense>
        </div>
    );
}

DefaultLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DefaultLayout;
