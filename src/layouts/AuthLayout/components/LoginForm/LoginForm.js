import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";
import styles from "../Form.module.scss";
import * as loginServices from "~/services/AuthService/loginService";
import { useAuth } from "~/contexts/AuthContext";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

function LoginForm({ onClose }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { loginSuccess } = useAuth();

    const handleLogin = async (event) => {
        event.preventDefault();
        
        // Validation
        if (!username.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        const request = {
            username,
            password,
        };

        setLoading(true);
        setError("");

        try {
            await loginServices.login(request);
            // Cập nhật auth state (fetch user info, đóng modal)
            await loginSuccess();
            toast.success("Đăng nhập thành công!");
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.log("Login failed:", error);
            const msg = error.response?.data?.message || "Đăng nhập thất bại";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx("container")}>
            <form className={cx("form")}>
                <h3 className={cx("title")}>Login Here</h3>

                {error && (
                    <div style={{ 
                        color: "red", 
                        marginBottom: "10px", 
                        padding: "10px", 
                        backgroundColor: "#ffe6e6",
                        borderRadius: "5px",
                        fontSize: "14px"
                    }}>
                        {error}
                    </div>
                )}

                <label>Username</label>
                <input
                    type="text"
                    placeholder="Email or Phone"
                    value={username}
                    onChange={(event) => {
                        setUsername(event.target.value);
                        setError("");
                    }}
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                    }}
                />

                <button
                    onClick={(event) => handleLogin(event)}
                    className={cx("login-btn")}
                    disabled={loading}
                >
                    {loading ? "Đang đăng nhập..." : "Log In"}
                </button>
                <div className={cx("social")}>
                    <div className={cx("go")}>
                        {/* <i class="fab fa-google"></i> Google */}
                        <FontAwesomeIcon
                            className={cx("icon")}
                            icon={faGoogle}
                        ></FontAwesomeIcon>
                        Google
                    </div>
                    <div className={cx("fb")}>
                        {/* <i class="fab fa-facebook"></i> Facebook */}
                        <FontAwesomeIcon
                            className={cx("icon")}
                            icon={faFacebook}
                        ></FontAwesomeIcon>
                        Facebook
                    </div>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
