import { useEffect, useState } from "react";
import * as getAnimesService from "~/services/getAnimesService";
import AnimeList from "~/components/AnimeList";

function AnimeStore({ homePageCustom = "" }) {
    const [animes, setAnimes] = useState([]);

    useEffect(() => {
        const fetchApi = async () => {
            const data = await getAnimesService.getAnimes();
            setAnimes(data);
        };

        fetchApi();
    }, []);
    return (
        <div>
            {!!homePageCustom || <h2>Anime Repository</h2>}
            <AnimeList data={animes} homePageCustom={homePageCustom} />
        </div>
    );
}

export default AnimeStore;
