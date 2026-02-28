import PropTypes from "prop-types";
import classNames from "classnames/bind";
import Header from "../components/Header";
import styles from "./NoSidebarLayout.module.scss";
import ChatBoxContainer from "~/components/ChatBoxContainer";

const cx = classNames.bind(styles);

function NoSidebarLayout({ children }) {
    return (
        <div className={cx("wrapper")}>
            <Header></Header>
            <div className={cx("container")}>
                <div className={cx("content")}>{children}</div>
            </div>
            
            {/* Chat boxes container - hiển thị ở bottom-right */}
            <ChatBoxContainer />
        </div>
    );
}

NoSidebarLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default NoSidebarLayout;
