import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import Sidebar from "~/layouts/components/Sidebar";
import Header from "../components/Header";
import styles from "./DefaultLayout.module.scss";
import SuggestedAnimes from "~/components/SuggestedAnimes";
import config from "~/config";
import MySwiper from "~/components/MySwiper";
import Banner from "~/components/Banner";

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
    const currentUrl = useLocation().pathname;
    return (
        <div className={cx("wrapper")}>
            <Header></Header>
            {config.routes.home === currentUrl && (
                <>
                    <Banner />
                    <SuggestedAnimes getBy="api/v1/animes/top-animes" custom />
                </>
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
