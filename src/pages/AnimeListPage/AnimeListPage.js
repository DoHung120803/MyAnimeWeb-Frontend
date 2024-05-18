import { useEffect, useState } from "react";
import * as getAnimesService from "~/services/getAnimesService";
import AnimeList from "~/components/AnimeList";

function AninmeListPage() {
    const [animes, setAnimes] = useState([]);

    useEffect(() => {
        const fetchApi = async () => {
            const data = await getAnimesService.getAnimes();
            setAnimes(data);
        };

        fetchApi();
    }, []);
    return <AnimeList data={animes} />;
}

export default AninmeListPage;
