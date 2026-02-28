import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faUser, faLock, faEnvelope, faCalendar, faEye, faEyeSlash, faArrowLeft, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { Fragment, useState } from "react";
import styles from "../Form.module.scss";
import * as registerServices from "~/services/AuthService/registerService";
import { useAuth } from "~/contexts/AuthContext";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

function RegisterForm({ onClose }) {
    const [step, setStep] = useState(1);
    const [request, setRequest] = useState({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        dob: new Date(),
    });

    const [rePassword, setRePassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { loginSuccess } = useAuth();

    const handleNext = (event) => {
        event.preventDefault();
        if (!request.firstName.trim() || !request.lastName.trim() || !request.email.trim()) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }
        setError("");
        setStep(2);
    };

    const handleChange = (event, fieldChanged) => {
        setRequest((prev) => ({ ...prev, [fieldChanged]: event.target.value }));
        setError("");
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        
        if (request.password !== rePassword) {
            setError("Mật khẩu không khớp");
            return;
        }

        if (request.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const fullName = `${request.firstName} ${request.lastName}`.trim();
            const avtUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=667eea&color=fff`;
            await registerServices.register({ ...request, avtUrl });
            await loginSuccess();
            toast.success("Đăng ký thành công!");
            if (onClose) onClose();
        } catch (error) {
            console.log("Register failed:", error);
            const msg = error.response?.data?.message || "Đăng ký thất bại";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = (event) => {
        event.preventDefault();
        setError("");
        setStep(1);
    };

    return (
        <div className={cx("container")}>
            <form className={cx("form")} onSubmit={step === 1 ? handleNext : handleRegister}>
                <div className={cx("form-header")}>
                    <h3 className={cx("title")}>Tạo tài khoản mới</h3>
                    <p className={cx("subtitle")}>Tham gia cộng đồng anime lớn nhất Việt Nam</p>
                </div>

                {/* Step indicator */}
                <div className={cx("step-indicator")}>
                    <div className={cx("step", { active: step >= 1, completed: step > 1 })}>
                        <div className={cx("step-dot")}>1</div>
                        <span>Thông tin</span>
                    </div>
                    <div className={cx("step-line", { active: step > 1 })}></div>
                    <div className={cx("step", { active: step >= 2 })}>
                        <div className={cx("step-dot")}>2</div>
                        <span>Tài khoản</span>
                    </div>
                </div>

                {error && (
                    <div className={cx("error-box")}>
                        <span className={cx("error-icon")}>⚠️</span>
                        {error}
                    </div>
                )}

                {step === 2 ? (
                    <Fragment>
                        <div className={cx("input-group")}>
                            <div className={cx("input-icon")}>
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                            <input
                                type="text"
                                placeholder="Tên đăng nhập"
                                value={request.username}
                                onChange={(e) => handleChange(e, "username")}
                                className={cx({ 'has-value': request.username })}
                            />
                        </div>

                        <div className={cx("input-group")}>
                            <div className={cx("input-icon")}>
                                <FontAwesomeIcon icon={faLock} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu"
                                value={request.password}
                                onChange={(e) => handleChange(e, "password")}
                                className={cx({ 'has-value': request.password })}
                            />
                            <button 
                                type="button" 
                                className={cx("toggle-password")}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>

                        <div className={cx("input-group")}>
                            <div className={cx("input-icon")}>
                                <FontAwesomeIcon icon={faLock} />
                            </div>
                            <input
                                type={showRePassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu"
                                value={rePassword}
                                onChange={(e) => setRePassword(e.target.value)}
                                className={cx({ 'has-value': rePassword })}
                            />
                            <button 
                                type="button" 
                                className={cx("toggle-password")}
                                onClick={() => setShowRePassword(!showRePassword)}
                            >
                                <FontAwesomeIcon icon={showRePassword ? faEyeSlash : faEye} />
                            </button>
                        </div>

                        <div className={cx('actions')}>
                            <button
                                type="button"
                                onClick={handleBack}
                                className={cx('back-btn')}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 8 }} />
                                Quay lại
                            </button>

                            <button
                                type="submit"
                                className={cx('submit-btn')}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className={cx("loading-spinner")}></span>
                                ) : null}
                                {loading ? "Đang đăng ký..." : "Đăng ký"}
                            </button>
                        </div>
                    </Fragment>
                ) : (
                    <Fragment>
                        <div className={cx('row')}> 
                            <div className={cx('col')}>
                                <div className={cx("input-group")}>
                                    <div className={cx("input-icon")}>
                                        <FontAwesomeIcon icon={faIdCard} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Họ"
                                        value={request.firstName}
                                        onChange={(e) => handleChange(e, "firstName")}
                                        className={cx({ 'has-value': request.firstName })}
                                    />
                                </div>
                            </div>

                            <div className={cx('col')}>
                                <div className={cx("input-group")}>
                                    <div className={cx("input-icon")}>
                                        <FontAwesomeIcon icon={faIdCard} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Tên"
                                        value={request.lastName}
                                        onChange={(e) => handleChange(e, "lastName")}
                                        className={cx({ 'has-value': request.lastName })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={cx("input-group")}>
                            <div className={cx("input-icon")}>
                                <FontAwesomeIcon icon={faEnvelope} />
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={request.email}
                                onChange={(e) => handleChange(e, "email")}
                                className={cx({ 'has-value': request.email })}
                            />
                        </div>

                        <div className={cx("input-group")}>
                            <div className={cx("input-icon")}>
                                <FontAwesomeIcon icon={faCalendar} />
                            </div>
                            <input
                                type="date"
                                data-date-format="YYYY MM DD"
                                value={request.dob}
                                onChange={(e) => handleChange(e, "dob")}
                                className={cx('has-value')}
                            />
                        </div>

                        <button type="submit" className={cx("submit-btn")}>
                            Tiếp tục
                        </button>
                    </Fragment>
                )}

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

export default RegisterForm;
