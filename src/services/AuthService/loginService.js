import config from "~/config";
import endpoints from "~/config/endpoints";
import * as httpRequest from "~/utils/httpRequest";
import { setToken } from "~/utils/authUtils";

export const login = async (request) => {
    try {
        const response = await httpRequest.post(endpoints.login, request);

        if (response && response.data.authenticated) {
            // Lưu token vào localStorage
            setToken(response.data.token);
            
            return response.data;
        } else {
            throw new Error("Authentication failed");
        }
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};
