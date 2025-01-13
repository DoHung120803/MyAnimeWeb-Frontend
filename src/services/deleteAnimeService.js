import * as httpRequest from "~/utils/httpRequest";

export const deleteAnime = async (id) => {
    try {
        const res = await httpRequest._delete("/animes/delete/" + id);
        return res;
    } catch (error) {
        console.log(error);
    }
};
