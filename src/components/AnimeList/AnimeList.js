import classNames from "classnames/bind";
import styles from "./AnimeList.module.scss";
import Anime from "./Anime/Anime";

const cx = classNames.bind(styles);

function AnimeList({ data }) {
    return (
        <div className={cx("list-anime")}>
            {data.map((anime, index) => (
                <Anime
                    key={index}
                    name={anime.name}
                    thumbnailUrl={anime.thumbnailUrl}
                    rate={anime.rate}
                    views={anime.views}
                />
            ))}
        </div>
    );
}

export default AnimeList;
