import * as httpRequest from "~/utils/httpRequest";

export const getAnime = async (id) => {
    try {
        const res = await httpRequest.getById("/animes/" + id);
        return res;
    } catch (error) {
        console.log(error);
    }
};
