import * as httpRequest from "~/utils/httpRequest";
import * as loginServices from "./loginService";
import endpoints from "~/config/endpoints";

export const register = async (request) => {
    try {
        const response = await httpRequest.post(endpoints.register, request);

        if (response && response.data && response.code === 1000) {
            // Nếu đăng ký thành công sẽ login
            await loginServices.login({
                username: request.username,
                password: request.password,
            });
            return response;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};
