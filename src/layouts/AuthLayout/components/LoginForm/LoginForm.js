import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faUser, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import styles from "../Form.module.scss";
import * as loginServices from "~/services/AuthService/loginService";
import { useAuth } from "~/contexts/AuthContext";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

function LoginForm({ onClose }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { loginSuccess } = useAuth();

    const handleLogin = async (event) => {
        event.preventDefault();
        
        if (!username.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        const request = { username, password };
        setLoading(true);
        setError("");

        try {
            await loginServices.login(request);
            await loginSuccess();
            toast.success("Đăng nhập thành công!");
            if (onClose) onClose();
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
            <form className={cx("form")} onSubmit={handleLogin}>
                <div className={cx("form-header")}>
                    <h3 className={cx("title")}>Chào mừng trở lại!</h3>
                    <p className={cx("subtitle")}>Đăng nhập để tiếp tục xem anime yêu thích</p>
                </div>

                {error && (
                    <div className={cx("error-box")}>
                        <span className={cx("error-icon")}>⚠️</span>
                        {error}
                    </div>
                )}

                <div className={cx("input-group")}>
                    <div className={cx("input-icon")}>
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <input
                        type="text"
                        placeholder="Tên đăng nhập hoặc email"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(""); }}
                        className={cx({ 'has-value': username })}
                    />
                </div>

                <div className={cx("input-group")}>
                    <div className={cx("input-icon")}>
                        <FontAwesomeIcon icon={faLock} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        className={cx({ 'has-value': password })}
                    />
                    <button 
                        type="button" 
                        className={cx("toggle-password")}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                </div>

                <div className={cx("form-options")}>
                    <label className={cx("remember-me")}>
                        <input type="checkbox" />
                        <span className={cx("checkmark")}></span>
                        Ghi nhớ đăng nhập
                    </label>
                    <a href="#!" className={cx("forgot-link")}>Quên mật khẩu?</a>
                </div>

                <button
                    type="submit"
                    className={cx("submit-btn")}
                    disabled={loading}
                >
                    {loading ? (
                        <span className={cx("loading-spinner")}></span>
                    ) : null}
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <div className={cx("divider")}>
                    <span>hoặc tiếp tục với</span>
                </div>

                <div className={cx("social")}>
                    <button type="button" className={cx("social-btn", "google-btn")}>
                        <FontAwesomeIcon className={cx("social-icon")} icon={faGoogle} />
                        Google
                    </button>
                    <button type="button" className={cx("social-btn", "facebook-btn")}>
                        <FontAwesomeIcon className={cx("social-icon")} icon={faFacebook} />
                        Facebook
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
