import Tippy from "@tippyjs/react/headless";

import classNames from "classnames/bind";
import styles from "./SuggestedAnimes.module.scss";
import { Wrapper as PopperWrapper } from "../Popper";
import AnimePreview from "./AnimePreview/AnimePreview";
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
    custom,
}) {
    const renderPreview = (props) => {
        return (
            <div className={cx("preview")} tabIndex="-1" {...props}>
                <PopperWrapper>
                    <AnimePreview />
                </PopperWrapper>
            </div>
        );
    };

    return (
        <div>
            <Tippy
                visible={false}
                interactive
                delay={[800, 0]}
                offset={[-30, !custom ? 0 : 100]} // nếu có custom thì cho tràn để hidden
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
                        className={cx(
                            "anime-item",
                            index % 2 === 0 && !custom && "even"
                        )}
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
                            {custom ? (
                                <p className={cx("rate")}>
                                    <span>{rate} / 10</span>
                                </p>
                            ) : (
                                <p className={cx("views")}>
                                    Lượt xem: <span>{views}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </Link>
            </Tippy>
        </div>
    );
}

export default AccountItem;
