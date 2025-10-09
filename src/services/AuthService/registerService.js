import * as httpRequest from "~/utils/httpRequest";
import * as loginServices from "./loginService";
import endpoints from "~/config/endpoints";

export const register = async (request, navigator) => {
    try {
        const response = await httpRequest.post(endpoints.register, request);

        if (response && response.data && response.code === 1000) {
            // nếu đăng ký thành công sẽ login và điều hướng sang home
            await loginServices.login(
                {
                    username: request.username,
                    password: request.password,
                },
                navigator
            );
        }
    } catch (error) {
        console.log(error);
    }
};
