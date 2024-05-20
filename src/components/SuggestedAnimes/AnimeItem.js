import Tippy from "@tippyjs/react/headless";

import classNames from "classnames/bind";
import styles from "./SuggestedAnimes.module.scss";
import { Wrapper as PopperWrapper } from "../Popper";
import AccountPreview from "./AnimePreview/AnimePreview";
import { Link } from "react-router-dom";
import config from "~/config";

const cx = classNames.bind(styles);

function AccountItem({
    index,
    id,
    name,
    description,
    rate,
    views,
    iframe,
    thumbnailUrl,
}) {
    console.log(index);
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
                <Link
                    to={config.routes.anime.replace(":id", id)}
                    state={{
                        id,
                        name,
                        description,
                        iframe,
                        rate,
                        views,
                        thumbnailUrl,
                    }}
                >
                    <div
                        className={cx("anime-item", index % 2 === 0 && "even")}
                    >
                        <img
                            className={cx("thumbnail")}
                            src={thumbnailUrl}
                            alt={name}
                        />
                        <div className={cx("item-info")}>
                            <p className={cx("name")}>
                                <strong>{name}</strong>
                            </p>
                            <p className={cx("views")}>
                                Lượt xem: <span>{views}</span>
                            </p>
                        </div>
                    </div>
                </Link>
            </Tippy>
        </div>
    );
}

export default AccountItem;
