import config from "~/config";
import * as httpRequest from "~/utils/httpRequest";

export const login = async (request, navigator) => {
    try {
        const response = await httpRequest.post("/auth/login", request);

        if (response && response.data.authenticated) {
            // lưu token vào local storage, điều hướng sang trang home
            localStorage.setItem("token", JSON.stringify(response.data.token));
            navigator(config.routes.home);
        }
    } catch (error) {
        console.log(error);
    }
};
