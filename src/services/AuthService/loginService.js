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

export const exchangeOAuth2Code = async (code) => {
    const response = await httpRequest.post(endpoints.oauth2Exchange, { code });

    if (!response?.data?.authenticated || !response.data.token) {
        throw new Error("OAuth2 authentication failed");
    }

    setToken(response.data.token);
    return response.data;
};
