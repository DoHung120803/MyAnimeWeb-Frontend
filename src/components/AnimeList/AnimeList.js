import classNames from "classnames/bind";
import styles from "./AnimeList.module.scss";
import Anime from "./Anime/Anime";

const cx = classNames.bind(styles);

function AnimeList({ data, homePageCustom = "" }) {
    console.log(data);
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
                    description={anime.description}
                    thumbnailUrl={anime.thumbnailUrl}
                    rate={anime.rate}
                    views={anime.views}
                    iframe={anime.iframe}
                    homePageCustom={!!homePageCustom}
                />
            ))}
        </div>
    );
}

export default AnimeList;
