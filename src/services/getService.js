import * as httpRequest from "~/utils/httpRequest";

const get = async (endpoint, options) => {
    try {
        const res = await httpRequest.get(endpoint, options);
        return res;
    } catch (error) {
        console.error(error.message);
    }
};

export default get;
