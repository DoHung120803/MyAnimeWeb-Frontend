import * as httpRequest from "~/utils/httpRequest";

export const get = async (getBy) => {
    try {
        const res = await httpRequest.get("/" + getBy);
        return res;
    } catch (error) {
        console.log(error);
    }
};
