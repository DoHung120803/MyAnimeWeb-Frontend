import axios from "axios";
import { getToken, logout } from "./authUtils";

const httpRequest = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

// Request interceptor - Tự động thêm token vào header của mỗi request
httpRequest.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi chung
httpRequest.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Xử lý lỗi 401 - Unauthorized (token hết hạn hoặc không hợp lệ)
        if (error.response && error.response.status === 401) {
            logout();
            // Dispatch event để AuthContext biết và mở modal login
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

// method get
export const get = async (path, options = {}) => {
    const response = await httpRequest.get(path, options);
    return response.data;
};

// method delete
export const _delete = async (path, options = {}) => {
    const response = await httpRequest.delete(path, options);
    return response.data;
};

export const post = async (path, data = {}, options = {}) => {
    const response = await httpRequest.post(path, data, options);
    return response.data;
};

export const put = async (path, data = {}, options = {}) => {
    const response = await httpRequest.put(path, data, options);
    return response.data;
};

export default httpRequest;
