import config from "~/config";
import endpoints from "~/config/endpoints";
import * as httpRequest from "~/utils/httpRequest";
import { setToken, setUser } from "~/utils/authUtils";

export const login = async (request, navigator) => {
    try {
        const response = await httpRequest.post(endpoints.login, request);

        if (response && response.data.authenticated) {
            // Lưu token vào localStorage
            setToken(response.data.token);
            
            // Điều hướng sang trang home
            navigator(config.routes.home);
            
            return response.data;
        } else {
            throw new Error("Authentication failed");
        }
    } catch (error) {
        console.error("Login error:", error);
        
        // Hiển thị thông báo lỗi cho user
        if (error.response) {
            // Server trả về lỗi
            const errorMessage = error.response.data?.message || "Đăng nhập thất bại";
            alert(errorMessage);
        } else if (error.request) {
            // Request được gửi nhưng không nhận được response
            alert("Không thể kết nối đến server");
        } else {
            // Lỗi khác
            alert(error.message || "Đã có lỗi xảy ra");
        }
        
        throw error;
    }
};
