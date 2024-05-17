import * as getAnimesService from "~/services/getAnimesService";
import AnimeList from "~/components/AnimeList";
import { useEffect, useState } from "react";

function AninmeListPage() {
    const [animes, setAmines] = useState([]);

    useEffect(() => {
        const fetchApi = async () => {
            const data = await getAnimesService.getAnimes();
            setAmines(data);
        };

        fetchApi();
    }, []);
    return <AnimeList data={animes} />;
}

export default AninmeListPage;
