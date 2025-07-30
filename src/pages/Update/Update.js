import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as getAnimeService from "~/services/getAnimeService";
import FormSubmit from "~/components/FormSubmit";

function Update() {
    const { id } = useParams();
    const [animeUpdated, setAnimeUpdated] = useState({});

    useEffect(() => {
        const fetchApi = async () => {
            const data = await getAnimeService.get(id);
            setAnimeUpdated(data);
        };

        fetchApi();
    }, [id]);

    return (
        <FormSubmit
            title="Update Anime"
            putMethod="put"
            anime={animeUpdated.data}
            path={`${process.env.REACT_APP_BASE_URL}/animes/update/${id}`}
        />
    );
}

export default Update;
