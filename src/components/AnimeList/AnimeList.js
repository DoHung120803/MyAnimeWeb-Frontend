import classNames from "classnames/bind";
import styles from "./AnimeList.module.scss";
import Anime from "./Anime/Anime";

const cx = classNames.bind(styles);

function AnimeList({ data, homePageCustom = "" }) {
    return (
        <div
            className={cx("list-anime", {
                [homePageCustom]: homePageCustom,
            })}
        >
            {data.map((anime, index) => (
                <Anime
                    key={index}
                    id={anime.id}
                    name={anime.name}
                    thumbnailUrl={anime.thumbnailUrl}
                    rate={anime.rate}
                    views={anime.views}
                    homePageCustom={!!homePageCustom}
                />
            ))}
        </div>
    );
}

export default AnimeList;
