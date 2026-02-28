import { useCallback, useEffect, useRef, useState } from "react";
import AnimeList from "~/components/AnimeList";
import get from "~/services/getService";
import endpoints from "~/config/endpoints";

const PAGE_SIZE = 20;

function AnimeStore({ homePageCustom = "" }) {
    const [animes, setAnimes] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const observer = useRef();
    const lastAnimeRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prev) => prev + 1);
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, hasMore],
    );

    useEffect(() => {
        const fetchApi = async () => {
            setLoading(true);
            try {
                const response = await get(endpoints.getAnimes, {
                    params: {
                        page: page,
                        size: PAGE_SIZE,
                    },
                });

                const data = response.data;
                setAnimes((prev) => [...prev, ...data.content]);
                setHasMore(!data.last);
            } catch (error) {
                console.error("Failed to fetch animes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApi();
    }, [page]);

    return (
        <div>
            {!!homePageCustom || <h2>Anime Repository</h2>}
            <AnimeList
                data={animes}
                homePageCustom={homePageCustom}
                lastAnimeRef={lastAnimeRef}
                loading={loading}
            />
        </div>
    );
}

export default AnimeStore;
