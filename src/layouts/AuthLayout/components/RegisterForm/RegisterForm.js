import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Fragment, useState } from "react";
import styles from "../Form.module.scss";
import * as registerServices from "~/services/AuthService/registerService";

const cx = classNames.bind(styles);

function RegisterForm() {
    const [next, setNext] = useState(false);

    const [request, setRequest] = useState({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        dob: new Date(),
    });

    const [rePassword, setRePassword] = useState("");
    const navigator = useNavigate();

    const handleNext = (event) => {
        event.preventDefault();
        setNext(true);
    };

    const handleChange = (event, fieldChanged) => {
        setRequest((prev) => {
            return { ...prev, [fieldChanged]: event.target.value };
        });
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        await registerServices.register(request, navigator);
    };

    return (
        <div className={cx("container")}>
            <form className={cx("form")}>
                <h3 className={cx("title")}>Register</h3>

                {!!next ? (
                    <Fragment>
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Email or Phone"
                            value={request.username}
                            onChange={(event) =>
                                handleChange(event, "username")
                            }
                        />

                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={request.password}
                            onChange={(event) =>
                                handleChange(event, "password")
                            }
                        />

                        <label>Re-enter Password</label>
                        <input
                            type="password"
                            placeholder="Re-enter Your Password"
                            value={rePassword}
                            onChange={(event) =>
                                setRePassword(event.target.value)
                            }
                        />

                        <button
                            onClick={(event) => handleRegister(event)}
                            className={cx("login-btn")}
                        >
                            Register
                        </button>
                    </Fragment>
                ) : (
                    <Fragment>
                        <label>First Name</label>
                        <input
                            type="text"
                            placeholder="Your first name"
                            value={request.firstName}
                            onChange={(event) =>
                                handleChange(event, "firstName")
                            }
                        />

                        <label>Last Name</label>
                        <input
                            type="password"
                            placeholder="Your last name"
                            value={request.lastName}
                            onChange={(event) =>
                                handleChange(event, "lastName")
                            }
                        />

                        <label>Date of Birth</label>
                        <input
                            type="date"
                            data-date-format="YYYY MM DD"
                            value={request.dob}
                            onChange={(event) => handleChange(event, "dob")}
                        />

                        <button
                            onClick={(event) => handleNext(event)}
                            className={cx("next-btn")}
                        >
                            Next
                        </button>
                    </Fragment>
                )}
                <div className={cx("social")}>
                    <div className={cx("go")}>
                        <FontAwesomeIcon
                            className={cx("icon")}
                            icon={faGoogle}
                        ></FontAwesomeIcon>
                        Google
                    </div>
                    <div className={cx("fb")}>
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

export default RegisterForm;
