import classNames from "classnames/bind";
import styles from "./Options.module.scss";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

function OptionItem({ title, className, onClick }) {
    return (
        <Link>
            <li className={cx("title", className)} onClick={onClick}>
                <span>{title}</span>
            </li>
        </Link>
    );
}

export default OptionItem;
