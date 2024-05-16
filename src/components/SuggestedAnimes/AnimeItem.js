import Tippy from "@tippyjs/react/headless";

import classNames from "classnames/bind";
import styles from "./SuggestedAnimes.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { Wrapper as PopperWrapper } from "../Popper";
import AccountPreview from "./AnimePreview/AnimePreview";

const cx = classNames.bind(styles);

function AccountItem() {
    const renderPreview = (props) => {
        return (
            <div className={cx("preview")} tabIndex="-1" {...props}>
                <PopperWrapper>
                    <AccountPreview />
                </PopperWrapper>
            </div>
        );
    };

    return (
        <div>
            <Tippy
                interactive
                delay={[800, 0]}
                offset={[-30, 0]}
                placement="bottom"
                render={renderPreview}
            >
                <div className={cx("account-item")}>
                    <img
                        className={cx("avatar")}
                        src="https://i.ytimg.com/vi/ilKg0DZrOwY/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLD2rVw2_5acczDOI1-1z-8IA9hLEw"
                        alt="avatar"
                    />
                    <div className={cx("item-info")}>
                        <p className={cx("nickname")}>
                            <strong>domanhhung</strong>
                            <FontAwesomeIcon
                                className={cx("check")}
                                icon={faCheckCircle}
                            />
                        </p>
                        <p className={cx("name")}>Đỗ Mạnh Hùng</p>
                    </div>
                </div>
            </Tippy>
        </div>
    );
}

export default AccountItem;
