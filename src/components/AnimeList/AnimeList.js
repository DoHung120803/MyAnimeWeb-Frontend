import classNames from "classnames/bind";
import styles from "./AnimeList.module.scss";
import Anime from "./Anime/Anime";

const cx = classNames.bind(styles);

function AnimeList() {
    return (
        <div className={cx("list-anime")}>
            <Anime
                name="anime"
                thumbnailUrl="https://i.ytimg.com/vi/ilKg0DZrOwY/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLD2rVw2_5acczDOI1-1z-8IA9hLEw"
                rate={9}
                view={100}
            />
            <Anime />
            <Anime />
            <Anime />
            <Anime />
            <Anime />
        </div>
    );
}

export default AnimeList;
