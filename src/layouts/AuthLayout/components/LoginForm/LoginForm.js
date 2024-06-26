import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";
import styles from "../Form.module.scss";
import * as loginServices from "~/services/AuthService/loginService";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigator = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        const request = {
            username,
            password,
        };

        await loginServices.login(request, navigator);
    };

    return (
        <div className={cx("container")}>
            <form className={cx("form")}>
                <h3 className={cx("title")}>Login Here</h3>

                <label>Username</label>
                <input
                    type="text"
                    placeholder="Email or Phone"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />

                <button
                    onClick={(event) => handleLogin(event)}
                    className={cx("login-btn")}
                >
                    Log In
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
