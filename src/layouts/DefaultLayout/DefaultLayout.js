import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import Sidebar from "~/layouts/components/Sidebar";
import Header from "../components/Header";
import styles from "./DefaultLayout.module.scss";
import PremiumAnimeCarousel from "~/components/PremiumAnimeCarousel";
import GenreCarousel from "~/components/GenreCarousel";
import config from "~/config";
import Banner from "~/components/Banner";
import ChatBoxContainer from "~/components/ChatBoxContainer";

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
    const currentUrl = useLocation().pathname;
    return (
        <div className={cx("wrapper")}>
            <Header></Header>
            {config.routes.home === currentUrl && (
                <div className={cx("banner-section")}> 
                    <Banner />
                </div>
            )}
            {config.routes.home === currentUrl && (
                <GenreCarousel 
                    title="Thể loại"
                />
            )}
            {config.routes.home === currentUrl && (
                <PremiumAnimeCarousel 
                    getBy="api/v1/animes/top-animes" 
                    title="Top đánh giá cao"
                />
            )}
            <div className={cx("container")}>
                <Sidebar></Sidebar>
                <div className={cx("content")}>{children}</div>
            </div>
            
            {/* Chat boxes container - hiển thị ở bottom-right */}
            <ChatBoxContainer />
        </div>
    );
}

DefaultLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DefaultLayout;
