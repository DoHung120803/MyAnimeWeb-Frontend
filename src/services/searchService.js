import * as httpRequest from "~/utils/httpRequest";

export const search = async (name) => {
    try {
        const res = await httpRequest.get("animes/search", {
            params: {
                name,
            },
        });
        return res;
    } catch (error) {
        console.log(error);
    }
};
