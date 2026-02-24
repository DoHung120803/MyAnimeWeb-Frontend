import React, { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import styles from './ChatBox.module.scss';
import Image from '~/components/Image';
import images from '~/assets/images';
import chatService from '~/services/chatService';
import { useChatContext } from '~/contexts/ChatContext';
import { getCurrentUserId } from '~/utils/authUtils';

const cx = classNames.bind(styles);

/**
 * Component ChatBox - Hiển thị một cửa sổ chat đơn
 * @param {object} conversation - Dữ liệu conversation
 * @param {boolean} isMinimized - Trạng thái minimize
 * @param {object} initialMessages - Messages ban đầu (optional) 
 * @param {function} onSendMessage - Callback để gửi tin nhắn qua WebSocket
 * @param {function} onSendTyping - Callback để gửi typing status qua WebSocket
 * @param {function} onRegisterReceiveMessage - Callback để đăng ký nhận tin nhắn
 * @param {function} onRegisterTypingHandler - Callback để đăng ký nhận typing events
 */
function ChatBox({ 
    conversation,
    conversationKey,
    isMinimized,
    initialMessages = null,
    onSendMessage, 
    onSendTyping,
    onRegisterReceiveMessage,
    onRegisterTypingHandler
}) {
    const { closeChatBox, toggleMinimize, focusChatBox, updateConversationLastMessage, updateChatBoxConversation } = useChatContext();

    // boxKey là key dùng để thao tác với ChatContext (conversation.id hoặc "new-{secondUserId}")
    // Dùng conversationKey nếu được truyền vào, fallback về conversation.id
    const boxKey = conversationKey ?? conversation.id;
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Map()); // Map<userId, timeoutId>
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const currentUserId = getCurrentUserId();
    const initialMessagesLoadedRef = useRef(false);

    /**
     * Fetch messages từ API
     */
    const fetchMessages = useCallback(async (pageNum = 0) => {
        if (loading) return;
        
        setLoading(true);
        try {
            const response = await chatService.getMessages(
                { conversationId: conversation.id },
                pageNum,
                20
            );

            if (response.data && response.data.content) {
                const newMessages = response.data.content.map(m => ({ ...m, _stableId: m.id }));
                
                // Nếu là page đầu tiên → replace toàn bộ
                // Nếu là page tiếp theo → append vào đầu (vì messages cũ hơn)
                if (pageNum === 0) {
                    setMessages(newMessages.reverse()); // Reverse để tin mới nhất ở dưới
                } else {
                    setMessages((prev) => [...newMessages.reverse(), ...prev]);
                }

                // Check còn messages không
                setHasMore(!response.data.last);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }, [conversation.id, loading]);

    /**
     * Load messages khi mở chat box lần đầu
     * Nếu có initialMessages thì dùng luôn, không thì fetch từ API
     */
    useEffect(() => {
        if (initialMessages && initialMessages.content && !initialMessagesLoadedRef.current) {
            // Dùng initialMessages nếu có
            const msgs = initialMessages.content.map(m => ({ ...m, _stableId: m.id }));
            setMessages(msgs.reverse());
            setHasMore(!initialMessages.last);
            initialMessagesLoadedRef.current = true;
        } else if (!initialMessages && conversation.id && !initialMessagesLoadedRef.current) {
            // Không có initialMessages → fetch từ API
            fetchMessages(0);
            initialMessagesLoadedRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Scroll xuống cuối khi có tin nhắn mới
     */
    useEffect(() => {
        if (messagesEndRef.current && !isMinimized) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isMinimized]);

    /**
     * Thêm tin nhắn mới từ WebSocket (được gọi từ parent)
     * Backend broadcast MessageModel: { id, conversationId, senderId, content, messageType, createdAt }
     */
    const addNewMessage = useCallback((message) => {
        // Chỉ thêm tin nhắn thuộc conversation này
        if (message.conversationId === conversation.id) {
            setMessages((prev) => {
                // 1. Tìm tin nhắn tạm tương ứng để replace (giữ nguyên vị trí để tránh nhảy order)
                // Relaxed comparison cho senderId để tránh lỗi type (string vs number)
                const tempIndex = prev.findIndex((m) => 
                     m.isTemp && 
                     m.content === message.content && 
                     String(m.senderId) === String(message.senderId)
                );

                if (tempIndex !== -1) {
                    const newMessages = [...prev];
                    // Giữ lại _stableId của tin nhắn tạm để React không unmount component (tránh nháy)
                    newMessages[tempIndex] = { ...message, _stableId: prev[tempIndex]._stableId };
                    return newMessages;
                }

                // 2. Nếu không có tin tạm, kiểm tra trùng lặp ID thật
                const exists = prev.some((m) => !m.isTemp && m.id === message.id);
                if (exists) return prev;

                // 3. Append vào cuối
                // Gán _stableId cho tin mới để dùng làm key
                return [...prev, { ...message, _stableId: message.id }];
            });
        }
    }, [conversation.id]);

    // Register receive message handler
    useEffect(() => {
        if (onRegisterReceiveMessage && boxKey) {
            onRegisterReceiveMessage(boxKey, addNewMessage);
        }
    }, [boxKey, addNewMessage, onRegisterReceiveMessage]);

    /**
     * Handle typing event từ WebSocket
     */
    const handleTypingEvent = useCallback((typingEvent) => {
        const { userId, isTyping: typing } = typingEvent;
        
        setTypingUsers((prev) => {
            const newMap = new Map(prev);
            
            // Clear timeout cũ nếu có
            if (newMap.has(userId)) {
                clearTimeout(newMap.get(userId));
            }
            
            if (typing) {
                // Set timeout để tự động clear typing sau 3 giây
                const timeoutId = setTimeout(() => {
                    setTypingUsers((prev) => {
                        const updated = new Map(prev);
                        updated.delete(userId);
                        return updated;
                    });
                }, 3000);
                
                newMap.set(userId, timeoutId);
            } else {
                newMap.delete(userId);
            }
            
            return newMap;
        });
    }, []);

    // Register typing handler
    useEffect(() => {
        if (onRegisterTypingHandler && boxKey) {
            onRegisterTypingHandler(boxKey, handleTypingEvent);
        }
    }, [boxKey, handleTypingEvent, onRegisterTypingHandler]);

    /**
     * Gửi typing status
     */
    const sendTypingStatus = useCallback((typing) => {
        if (onSendTyping) {
            onSendTyping({
                conversationId: conversation.id,
                isTyping: typing,
            });
        }
    }, [conversation.id, onSendTyping]);

    /**
     * Handle input change với debounce cho typing indicator
     */
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        
        // Gửi typing = true khi bắt đầu gõ
        if (!isTyping && value.trim()) {
            setIsTyping(true);
            sendTypingStatus(true);
        }
        
        // Debounce: Clear timeout cũ và tạo timeout mới
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Sau 2 giây không gõ → gửi typing = false
        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                sendTypingStatus(false);
            }
        }, 2000);
    };

    /**
     * Gửi tin nhắn
     * - Nếu conversation.id tồn tại: gửi qua WebSocket như bình thường
     * - Nếu conversation.id = null: tạo conversation mới qua API rồi gửi tin nhắn đầu tiên
     */
    const handleSendMessage = async () => {
        if (!inputValue.trim() || sending) return;

        // Clear typing status khi gửi tin nhắn
        if (isTyping) {
            setIsTyping(false);
            sendTypingStatus(false);
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        const content = inputValue.trim();
        setInputValue('');

        // Trường hợp chưa có conversation (cuộc trò chuyện mới)
        if (!conversation.id) {
            setSending(true);
            try {
                // Tạo conversation mới
                const createRes = await chatService.createConversation({
                    type: 1, // DIRECT
                    memberIds: [conversation.secondUserId],
                });

                if (!createRes || !createRes.data) {
                    toast.error('Không thể tạo cuộc trò chuyện');
                    setInputValue(content);
                    return;
                }

                const newConversation = {
                    ...conversation,
                    id: createRes.data.id,
                };

                // Cập nhật conversationId trong ChatContext
                updateChatBoxConversation(conversation.secondUserId, newConversation);

                // Gửi tin nhắn đầu tiên qua WebSocket
                const messageData = {
                    conversationId: newConversation.id,
                    content,
                };
                if (onSendMessage) {
                    onSendMessage(messageData);
                }

                // Optimistic update
                const tempId = `temp-${Date.now()}`;
                const tempMessage = {
                    id: tempId,
                    _stableId: tempId,
                    conversationId: newConversation.id,
                    content,
                    senderId: currentUserId,
                    createdAt: new Date().toISOString(),
                    isTemp: true,
                };
                setMessages((prev) => [...prev, tempMessage]);
                updateConversationLastMessage(newConversation.id, { content, timestamp: new Date().toISOString() });
            } catch (err) {
                console.error('Error creating conversation:', err);
                toast.error('Không thể tạo cuộc trò chuyện');
                setInputValue(content);
            } finally {
                setSending(false);
            }
            return;
        }

        const messageData = {
            conversationId: conversation.id,
            content,
        };

        // Gửi qua WebSocket → backend sẽ lưu DB và broadcast qua /conversation
        if (onSendMessage) {
            onSendMessage(messageData);
        }

        // Thêm tin nhắn tạm vào UI (optimistic update)
        // Sẽ được thay thế bằng tin nhắn thật khi backend broadcast lại
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId, // Temporary ID (string để không trùng với ID thật từ DB)
            _stableId: tempId, // Stable Key cho React
            conversationId: conversation.id,
            content,
            senderId: currentUserId,
            createdAt: new Date().toISOString(),
            isTemp: true,
        };
        setMessages((prev) => [...prev, tempMessage]);

        // Cập nhật lastMessage trong conversations dropdown
        updateConversationLastMessage(conversation.id, {
            content,
            timestamp: new Date().toISOString(),
        });
    };

    /**
     * Format time
     */
    const formatTime = (dateTime) => {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    /**
     * Handle click vào header → focus chat box
     */
    const handleHeaderClick = () => {
        if (isMinimized) {
            toggleMinimize(boxKey);
        } else {
            focusChatBox(boxKey);
        }
    };

    return (
        <div className={cx('chat-box', { minimized: isMinimized })}>
            {/* Nút close khi minimize - hiển thị khi hover */}
            {isMinimized && (
                <button
                    className={cx('close-btn-minimized')}
                    onClick={(e) => {
                        e.stopPropagation();
                        closeChatBox(boxKey);
                    }}
                    aria-label="Close"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                </button>
            )}
            
            {/* Header */}
            <div className={cx('header')} onClick={handleHeaderClick}>
                <div className={cx('user-info')}>
                    <Image
                        src={conversation.chatAvt || images.noImage}
                        alt={conversation.name}
                        className={cx('avatar')}
                    />
                    <div className={cx('user-details')}>
                        <span className={cx('name')}>{conversation.name}</span>
                        <span className={cx('status')}>Đang hoạt động</span>
                    </div>
                </div>

                <div className={cx('actions')}>
                    {/* Minimize button */}
                    <button
                        className={cx('action-btn')}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMinimize(boxKey);
                        }}
                        aria-label="Minimize"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13H5v-2h14v2z" />
                        </svg>
                    </button>

                    {/* Close button */}
                    <button
                        className={cx('action-btn')}
                        onClick={(e) => {
                            e.stopPropagation();
                            closeChatBox(boxKey);
                        }}
                        aria-label="Close"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
                <>
                    <div className={cx('messages')} ref={messagesContainerRef}>
                        {loading && page === 0 ? (
                            <div className={cx('loading')}>Đang tải...</div>
                        ) : messages.length === 0 ? (
                            <div className={cx('empty')}>Chưa có tin nhắn nào</div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <div
                                        key={message._stableId || message.id}
                                        className={cx('message', {
                                            'own-message': message.senderId === currentUserId,
                                        })}
                                    >
                                        <div className={cx('message-content')}>
                                            {message.content}
                                        </div>
                                        <span className={cx('message-time')}>
                                            {formatTime(message.createdAt)}
                                        </span>
                                    </div>
                                ))}
                                
                                {/* Typing indicator */}
                                {typingUsers.size > 0 && (
                                    <div className={cx('typing-indicator')}>
                                        <div className={cx('typing-dots')}>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <span className={cx('typing-text')}>Đang nhập...</span>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div className={cx('input-wrapper')}>
                        <input
                            type="text"
                            className={cx('input')}
                            placeholder="Aa"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button
                            className={cx('send-btn')}
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || sending}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ChatBox;
