import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "~/contexts/AuthContext";
import * as loginServices from "~/services/AuthService/loginService";

const OAUTH2_MESSAGE_TYPE = "myanime:oauth2-callback";

export const useOAuth2Login = (onClose) => {
    const { loginSuccess } = useAuth();
    const popupRef = useRef(null);

    useEffect(() => {
        const handleOAuth2Message = async (event) => {
            if (
                event.origin !== window.location.origin ||
                // event.source !== popupRef.current ||
                event.data?.type !== OAUTH2_MESSAGE_TYPE
            ) {
                return;
            }

            popupRef.current = null;

            if (event.data.error || !event.data.code) {
                toast.error(event.data.error || "Đăng nhập thất bại");
                return;
            }

            try {
                await loginServices.exchangeOAuth2Code(event.data.code);
                await loginSuccess();
                toast.success("Đăng nhập thành công!");
                onClose?.();
            } catch (error) {
                const message = error.response?.data?.message || "Đăng nhập OAuth2 thất bại";
                toast.error(message);
            }
        };

        window.addEventListener("message", handleOAuth2Message);
        return () => window.removeEventListener("message", handleOAuth2Message);
    }, [loginSuccess, onClose]);

    return useCallback((provider) => {
        const configuredBaseUrl = process.env.REACT_APP_BASE_URL;

        if (!configuredBaseUrl) {
            toast.error("Chưa cấu hình địa chỉ máy chủ đăng nhập OAuth2.");
            return;
        }

        const baseUrl = configuredBaseUrl.replace(/\/$/, "");
        const width = 520;
        const height = 680;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
            `${baseUrl}/oauth2/authorization/${provider}`,
            "myanime-oauth2",
            `popup=yes,width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
            toast.error("Trình duyệt đã chặn popup đăng nhập. Hãy cho phép popup cho trang này.");
            return;
        }

        popupRef.current = popup;
        popup.focus();
    }, []);
};

export { OAUTH2_MESSAGE_TYPE };
