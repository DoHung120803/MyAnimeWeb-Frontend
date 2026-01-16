import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import Sidebar from "~/layouts/components/Sidebar";
import Header from "../components/Header";
import styles from "./DefaultLayout.module.scss";
import PremiumAnimeCarousel from "~/components/PremiumAnimeCarousel";
import config from "~/config";
import Banner from "~/components/Banner";
import HomeSidebar from "~/components/HomeSidebar";

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
    const currentUrl = useLocation().pathname;
    return (
        <div className={cx("wrapper")}>
            <Header></Header>
            {config.routes.home === currentUrl && (
                <div className={cx("banner-section")}> 
                    {/* New independent left sidebar for home banner area */}
                    <HomeSidebar />
                    <Banner />
                </div>
            )}
            {config.routes.home === currentUrl && (
                <PremiumAnimeCarousel 
                    getBy="api/v1/animes/top-animes" 
                    title="Top Rated Anime"
                />
            )}
            <div className={cx("container")}>
                <Sidebar></Sidebar>
                <div className={cx("content")}>{children}</div>
            </div>
        </div>
    );
}

DefaultLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DefaultLayout;
