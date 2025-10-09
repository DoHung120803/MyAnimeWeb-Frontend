import React from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './AuthModal.module.scss';

const cx = classNames.bind(styles);

function AuthModal({ isOpen, onClose, children, title }) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={cx('overlay')} onClick={handleOverlayClick}>
            <div className={cx('modal')}>
                <div className={cx('header')}>
                    <button className={cx('close-btn')} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className={cx('content')}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AuthModal;