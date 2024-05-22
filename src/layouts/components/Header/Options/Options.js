import classNames from "classnames/bind";
import styles from "./Options.module.scss";
import OptionItem from "./OptionItem";

const cx = classNames.bind(styles);

function Menu() {
    return (
        <div className={cx("container")}>
            <ul className={cx("option-menu")}>
                <OptionItem title="trang chủ" />
                <OptionItem title="thể loại" />
                <OptionItem title="trạng thái" />
                <OptionItem title="xem nhiều" />
                <OptionItem title="bình luận nhiều" />
                <OptionItem title="năm" />
            </ul>
        </div>
    );
}

export default Menu;
