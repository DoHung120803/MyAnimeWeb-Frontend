import * as httpRequest from "~/utils/httpRequest";

export const get = async () => {
    try {
        const res = await httpRequest.get("/animes");
        return res;
    } catch (error) {
        console.log(error);
    }
};
