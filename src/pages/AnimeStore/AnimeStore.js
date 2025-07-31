import { useEffect, useState } from "react";
import AnimeList from "~/components/AnimeList";
import get from "~/services/getService";
import endpoints from "~/config/endpoints";

function AnimeStore({ homePageCustom = "" }) {
    const [animes, setAnimes] = useState([]);

    useEffect(() => {
        if (localStorage.getItem("animes")) {
            return;
        }
        const fetchApi = async () => {
            const response = await get(endpoints.getAnimes, {
                params: {
                    page: 1,
                    size: 100,
                },
            });

            setAnimes(response.data.content);

            localStorage.setItem(
                "animes",
                JSON.stringify(response.data.content)
            );
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
