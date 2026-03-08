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
                {/* Decorative side panel */}
                <div className={cx('side-panel')}>
                    <div className={cx('side-content')}>
                        <div className={cx('brand')}>
                            <div className={cx('brand-icon')}>
                                <span role="img" aria-label="anime">🎬</span>
                            </div>
                            <h2 className={cx('brand-name')}>MyAnime</h2>
                        </div>
                        <p className={cx('side-tagline')}>
                            Khám phá thế giới anime tuyệt vời cùng chúng tôi
                        </p>
                        <div className={cx('side-features')}>
                            <div className={cx('feature-item')}>
                                <span className={cx('feature-icon')}>🎯</span>
                                <span>Hàng nghìn bộ anime chất lượng cao</span>
                            </div>
                            <div className={cx('feature-item')}>
                                <span className={cx('feature-icon')}>💬</span>
                                <span>Cộng đồng sôi động & thân thiện</span>
                            </div>
                            <div className={cx('feature-item')}>
                                <span className={cx('feature-icon')}>⚡</span>
                                <span>Cập nhật tập mới nhanh nhất</span>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className={cx('deco-circle', 'circle-1')}></div>
                        <div className={cx('deco-circle', 'circle-2')}></div>
                        <div className={cx('deco-circle', 'circle-3')}></div>
                    </div>
                </div>

                {/* Form panel */}
                <div className={cx('form-panel')}>
                    <button className={cx('close-btn')} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <div className={cx('content')}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;