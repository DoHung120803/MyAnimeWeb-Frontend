import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as getAnimeService from "~/services/getAnimeService";
import FormSubmit from "~/components/FormSubmit";

function UpdateAnimePage() {
    const { id } = useParams();
    const [animeUpdated, setAnimeUpdated] = useState({});

    useEffect(() => {
        const fetchApi = async () => {
            const data = await getAnimeService.getAnime(id);
            setAnimeUpdated(data);
        };

        fetchApi();
    }, []);

    return (
        <FormSubmit
            title="Update Anime"
            putMethod="put"
            anime={animeUpdated}
            path={"http://localhost:8080/animes/update/" + id}
        />
    );
}

export default UpdateAnimePage;
