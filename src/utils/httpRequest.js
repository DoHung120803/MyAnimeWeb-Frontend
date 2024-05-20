import axios from "axios";

const httpRequest = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

// method get animes
export const get = async (path, options = {}) => {
    const response = await httpRequest.get(path, options);
    return response.data;
};

// method delete anime
export const deleteAnime = async (path, options = {}) => {
    const response = await httpRequest.delete(path, options);
    return response.data;
};

export default httpRequest;
