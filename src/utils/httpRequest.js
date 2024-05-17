import axios from "axios";

const httpRequest = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

// method get animes
export const get = async (path, options = {}) => {
    const response = await httpRequest.get(path, options);
    return response.data;
};

// method put to update anime
export const put = async (path, data, options = {}) => {
    // const response = await httpRequest.put(path, data, options);
    // return response.data;
    await httpRequest.put(path, data, options);
};

export const getById = async (path, options = {}) => {
    const response = await httpRequest.get(path, options);
    return response.data;
};

export default httpRequest;
