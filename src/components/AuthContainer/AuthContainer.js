import React, { useState } from 'react';
import classNames from 'classnames/bind';
import LoginForm from '~/layouts/AuthLayout/components/LoginForm';
import RegisterForm from '~/layouts/AuthLayout/components/RegisterForm';
import styles from './AuthContainer.module.scss';

const cx = classNames.bind(styles);

function AuthContainer({ initialMode = 'login', onClose }) {
    const [mode, setMode] = useState(initialMode);

    const switchToRegister = () => setMode('register');
    const switchToLogin = () => setMode('login');

    return (
        <div className={cx('auth-container')}>
            {mode === 'login' ? (
                <div className={cx('form-wrapper')}>
                    <LoginForm onClose={onClose} />
                    <div className={cx('switch-mode')}>
                        <span>Chưa có tài khoản? </span>
                        <button 
                            className={cx('switch-btn')} 
                            onClick={switchToRegister}
                        >
                            Đăng ký ngay
                        </button>
                    </div>
                </div>
            ) : (
                <div className={cx('form-wrapper')}>
                    <RegisterForm onClose={onClose} />
                    <div className={cx('switch-mode')}>
                        <span>Đã có tài khoản? </span>
                        <button 
                            className={cx('switch-btn')} 
                            onClick={switchToLogin}
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AuthContainer;