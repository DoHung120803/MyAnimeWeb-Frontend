import React, { useState } from 'react';
import classNames from 'classnames/bind';
import LoginForm from '~/layouts/AuthLayout/components/LoginForm';
import RegisterForm from '~/layouts/AuthLayout/components/RegisterForm';
import styles from './AuthContainer.module.scss';

const cx = classNames.bind(styles);

function AuthContainer({ initialMode = 'login', onClose }) {
    const [mode, setMode] = useState(initialMode);
    const [animating, setAnimating] = useState(false);

    const switchMode = (newMode) => {
        if (animating) return;
        setAnimating(true);
        setTimeout(() => {
            setMode(newMode);
            setAnimating(false);
        }, 250);
    };

    return (
        <div className={cx('auth-container')}>
            <div className={cx('form-wrapper', { 'slide-out': animating })}>
                {mode === 'login' ? (
                    <>
                        <LoginForm onClose={onClose} />
                        <div className={cx('switch-mode')}>
                            <span>Chưa có tài khoản? </span>
                            <button 
                                className={cx('switch-btn')} 
                                onClick={() => switchMode('register')}
                            >
                                Đăng ký ngay
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <RegisterForm onClose={onClose} />
                        <div className={cx('switch-mode')}>
                            <span>Đã có tài khoản? </span>
                            <button 
                                className={cx('switch-btn')} 
                                onClick={() => switchMode('login')}
                            >
                                Đăng nhập ngay
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AuthContainer;