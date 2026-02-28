import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './ChatDropdown.module.scss';
import ChatItem from '~/components/ChatItem';
import chatService from '~/services/chatService';
import { useChatContext } from '~/contexts/ChatContext';

const cx = classNames.bind(styles);

/**
 * Dropdown hiển thị danh sách conversations
 * Tương tự Facebook Messenger dropdown
 */
function ChatDropdown({isVisible, onClose, onConversationClick, parentRef }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasFetched, setHasFetched] = useState(false); // Track đã fetch chưa
    const lastFetchTimeRef = useRef(null); // Track thời gian fetch cuối cùng
    const dropdownRef = useRef(null);
    
    // Lấy state và functions từ ChatContext
    const { 
        isSoundEnabled, 
        toggleSound, 
        conversations, 
        updateConversations 
    } = useChatContext();

    // Fetch conversations từ API
    const fetchConversations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await chatService.getUserConversations(0, 20);
            
            // Response structure: {code, message, data: {content: [...], totalElements, ...}}
            if (response.data && response.data.content) {
                updateConversations(response.data.content);
            } else {
                updateConversations([]);
            }
            setHasFetched(true); // Đánh dấu đã fetch
            lastFetchTimeRef.current = Date.now(); // Lưu thời gian fetch
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
            setError('Không thể tải danh sách trò chuyện');
            updateConversations([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch conversations khi dropdown mở
    // - Lần đầu tiên: luôn fetch
    // - Các lần sau: fetch nếu đã quá 30 giây kể từ lần fetch cuối
    useEffect(() => {
        if (isVisible) {
            const shouldRefetch = !hasFetched || 
                (lastFetchTimeRef.current && Date.now() - lastFetchTimeRef.current > 30000);
            
            if (shouldRefetch) {
                fetchConversations();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    // Click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            
            // Check nếu click nằm ngoài dropdown VÀ ngoài parent (MessageIcon button)
            const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
            const clickedOutsideParent = parentRef?.current && !parentRef.current.contains(event.target);
            
            if (clickedOutsideDropdown && clickedOutsideParent) {
                console.log('Closing dropdown...');
                onClose();
            }
        };

        if (isVisible) {
            // Delay để tránh trigger ngay khi mở
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, onClose, parentRef]);

    const handleConversationClick = (conversation) => {
        if (onConversationClick) {
            onConversationClick(conversation);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={cx('dropdown-wrapper')} ref={dropdownRef}>
            <div className={cx('dropdown-header')}>
                <h3 className={cx('title')}>Tin nhắn</h3>
                <div className={cx('header-actions')}>
                    {/* Sound toggle button */}
                    <button 
                        className={cx('sound-btn')} 
                        onClick={toggleSound}
                        aria-label={isSoundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                        title={isSoundEnabled ? 'Tắt âm thanh thông báo' : 'Bật âm thanh thông báo'}
                    >
                        {isSoundEnabled ? (
                            // Icon loa bật
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                        ) : (
                            // Icon loa tắt
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                            </svg>
                        )}
                    </button>
                    
                    {/* Options button */}
                    <button className={cx('options-btn')} aria-label="Options">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Search bar */}
            <div className={cx('search-wrapper')}>
                <input 
                    type="text" 
                    className={cx('search-input')} 
                    placeholder="Tìm kiếm trong Messenger"
                />
            </div>

            {/* Conversations list */}
            <div className={cx('conversations-list')}>
                {loading ? (
                    <div className={cx('loading')}>
                        <div className={cx('spinner')}></div>
                        <p>Đang tải...</p>
                    </div>
                ) : error ? (
                    <div className={cx('error')}>
                        <p>{error}</p>
                        <button onClick={fetchConversations} className={cx('retry-btn')}>
                            Thử lại
                        </button>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className={cx('empty')}>
                        <p>Chưa có tin nhắn nào</p>
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <ChatItem
                            key={conversation.id}
                            conversation={conversation}
                            onClick={() => handleConversationClick(conversation)}
                            unreadCount={conversation.unreadCount || 0}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className={cx('dropdown-footer')}>
                <a href="/messages" className={cx('see-all')}>
                    Xem tất cả trong Messenger
                </a>
            </div>
        </div>
    );
}

export default ChatDropdown;
