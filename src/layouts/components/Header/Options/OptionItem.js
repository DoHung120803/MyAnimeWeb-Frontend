import classNames from "classnames/bind";
import styles from "./Options.module.scss";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

function optionItem({ title }) {
    return (
        <Link>
            <li className={cx("title")}>
                <span>{title}</span>
            </li>
        </Link>
    );
}

export default optionItem;
