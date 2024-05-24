import { useEffect, useState } from "react";
import * as getAnimesService from "~/services/getAnimesService";
import AnimeList from "~/components/AnimeList";

function AnimeStore({ homePageCustom = "" }) {
    const [animes, setAnimes] = useState([]);

    useEffect(() => {
        if (localStorage.getItem("animes")) {
            return;
        }
        const fetchApi = async () => {
            const data = await getAnimesService.get();
            setAnimes(data);
            localStorage.setItem("animes", JSON.stringify(data));
        };

        fetchApi();
    }, []);
    return (
        <div>
            {!!homePageCustom || <h2>Anime Repository</h2>}
            <AnimeList
                data={JSON.parse(localStorage.getItem("animes")) || animes}
                homePageCustom={homePageCustom}
            />
        </div>
    );
}

export default AnimeStore;
