import * as httpRequest from "~/utils/httpRequest";

export const get = async (id) => {
    try {
        const res = await httpRequest.get("/animes/" + id);
        return res;
    } catch (error) {
        console.log(error);
    }
};
