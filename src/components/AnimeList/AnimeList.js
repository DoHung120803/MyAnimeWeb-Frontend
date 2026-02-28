import classNames from "classnames/bind";
import styles from "./AnimeList.module.scss";
import Anime from "./Anime/Anime";

const cx = classNames.bind(styles);

function AnimeList({ data, homePageCustom = "", lastAnimeRef, loading }) {
    return (
        <div
            className={cx("list-anime", {
                [homePageCustom]: homePageCustom,
            })}
        >
            {data.map((anime, index) => {
                const isLast = index === data.length - 1;
                return (
                    <div ref={isLast ? lastAnimeRef : null} key={anime.id ?? index}>
                        <Anime
                            id={anime.id}
                            name={anime.name}
                            description={anime.description}
                            thumbnailUrl={anime.thumbnailUrl}
                            rate={anime.rate}
                            views={anime.views}
                            iframe={anime.iframe}
                            homePageCustom={!!homePageCustom}
                        />
                    </div>
                );
            })}
            {loading && (
                <div className={cx("loading-spinner")}>
                    <div className={cx("spinner")}></div>
                    <span>Đang tải...</span>
                </div>
            )}
        </div>
    );
}

export default AnimeList;
