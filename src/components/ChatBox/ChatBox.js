import React, { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import styles from './ChatBox.module.scss';
import Image from '~/components/Image';
import images from '~/assets/images';
import chatService from '~/services/chatService';
import uploadService from '~/services/uploadService';
import { useChatContext } from '~/contexts/ChatContext';
import { getCurrentUserId } from '~/utils/authUtils';

const cx = classNames.bind(styles);

/**
 * AudioPlayer Component - Facebook style audio player
 */
function AudioPlayer({ src, isOwnMessage }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressClick = (e) => {
        const audio = audioRef.current;
        if (!audio) return;

        const bounds = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const width = bounds.width;
        const percent = x / width;
        const newTime = percent * duration;
        
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={cx('fb-audio-player', { 'own-message': isOwnMessage })}>
            <audio ref={audioRef} src={src} preload="metadata" />
            
            <button className={cx('fb-audio-play-btn')} onClick={togglePlay}>
                {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                )}
            </button>

            <div className={cx('fb-audio-waveform')} onClick={handleProgressClick}>
                <div className={cx('fb-audio-bars')}>
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className={cx('fb-audio-bar', {
                                'active': (i / 30) * 100 <= progress
                            })}
                            style={{
                                height: `${Math.random() * 60 + 40}%`
                            }}
                        />
                    ))}
                </div>
                <div className={cx('fb-audio-progress')} style={{ width: `${progress}%` }} />
            </div>

            <span className={cx('fb-audio-time')}>
                {formatTime(duration > 0 ? duration - currentTime : 0)}
            </span>
        </div>
    );
}

// Constants cho message type (khớp với BE MessageType enum)
const MESSAGE_TYPE = {
    TEXT: 1,
    MEDIA: 2,
};

// Constants cho file type (khớp với BE FileExtensionType)
const FILE_TYPE = {
    IMAGE: 1,
    VIDEO: 2,
    AUDIO: 3,
    FILE: 4,
};

// Accepted file types
const ACCEPTED_FILE_TYPES = 'image/png,image/jpeg,image/jpg,image/webp,video/mp4,audio/mp3,audio/mpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/zip,application/x-rar-compressed';

const MAX_FILES = 5; // Tối đa 5 file mỗi lần gửi

/**
 * Component ChatBox - Hiển thị một cửa sổ chat đơn
 * @param {object} conversation - Dữ liệu conversation
 * @param {boolean} isMinimized - Trạng thái minimize
 * @param {boolean} hasUnread - Có tin nhắn chưa đọc hay không
 * @param {number} unreadCount - Số lượng tin nhắn chưa đọc
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
    hasUnread = false,
    unreadCount = 0,
    initialMessages = null,
    onSendMessage, 
    onSendTyping,
    onRegisterReceiveMessage,
    onRegisterTypingHandler
}) {
    const { closeChatBox, toggleMinimize, focusChatBox, updateConversationLastMessage, updateChatBoxConversation, refreshConversations, markConversationAsRead, focusedChatBoxId, setFocusedChatBoxId } = useChatContext();

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
    const [selectedFiles, setSelectedFiles] = useState([]); // Files chờ gửi: [{ file, preview, type }]
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const currentUserId = getCurrentUserId();
    const initialMessagesLoadedRef = useRef(false);

    /**
     * Lấy ID của tin nhắn cuối cùng (tin nhắn thật, không phải temp)
     */
    const getLastRealMessageId = useCallback((msgs) => {
        for (let i = msgs.length - 1; i >= 0; i--) {
            if (!msgs[i].isTemp && msgs[i].id) {
                return msgs[i].id;
            }
        }
        return null;
    }, []);

    /**
     * Xử lý download file
     */
    const handleDownloadFile = useCallback(async (fileUrl, fileName) => {
        try {
            toast.info('Đang tải xuống...');
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Tải xuống thành công!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Không thể tải xuống file');
        }
    }, []);

    /**
     * Xử lý khi user click vào chatbox (bất kỳ vùng nào)
     * → Đánh dấu đã đọc + set focused
     */
    const handleChatBoxInteraction = useCallback(() => {
        if (!conversation.id) return;
        
        // Set chatbox này là focused
        setFocusedChatBoxId(conversation.id);

        // Đánh dấu đã đọc nếu có tin chưa đọc
        if (hasUnread) {
            const lastId = getLastRealMessageId(messages);
            if (lastId) {
                markConversationAsRead(conversation.id, lastId);
            }
        }
    }, [conversation.id, hasUnread, messages, getLastRealMessageId, markConversationAsRead, setFocusedChatBoxId]);

    /**
     * Auto mark as read khi chatbox được focus (ví dụ mở từ dropdown) và messages đã load xong.
     * Giải quyết case: user mở chatbox từ dropdown → focusedChatBoxId được set → 
     * nhưng messages chưa load → handleChatBoxInteraction không thể lấy lastReadMessageId.
     * Effect này chờ messages load xong rồi mới mark as read.
     */
    useEffect(() => {
        if (
            focusedChatBoxId === conversation.id &&
            hasUnread &&
            !isMinimized &&
            messages.length > 0
        ) {
            const lastId = getLastRealMessageId(messages);
            if (lastId) {
                markConversationAsRead(conversation.id, lastId);
            }
        }
    }, [focusedChatBoxId, conversation.id, hasUnread, isMinimized, messages, getLastRealMessageId, markConversationAsRead]);

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
     * Backend broadcast MessageModel: { id, conversationId, senderId, content, messageType, createdAt, attachments }
     */
    const addNewMessage = useCallback((message) => {
        // Chỉ thêm tin nhắn thuộc conversation này
        if (message.conversationId === conversation.id) {
            setMessages((prev) => {
                // 1. Tìm tin nhắn tạm tương ứng để replace (giữ nguyên vị trí để tránh nhảy order)
                // Relaxed comparison cho senderId để tránh lỗi type (string vs number)
                const tempIndex = prev.findIndex((m) => {
                    if (!m.isTemp || String(m.senderId) !== String(message.senderId)) return false;
                    // Match text messages by content
                    if (message.messageType === MESSAGE_TYPE.TEXT) {
                        return m.content === message.content;
                    }
                    // Match media messages by messageType (media temp messages are unique enough)
                    if (message.messageType === MESSAGE_TYPE.MEDIA) {
                        return m.messageType === MESSAGE_TYPE.MEDIA;
                    }
                    return m.content === message.content;
                });

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
     * Render message content với URL được chuyển thành link
     */
    const renderMessageContent = (content) => {
        if (!content) return null;

        // URL regex pattern - hỗ trợ http, https, www
        const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
        const parts = content.split(urlPattern).filter(Boolean);

        return parts.map((part, index) => {
            // Check if part is a URL
            if (part && (part.startsWith('http://') || part.startsWith('https://') || part.startsWith('www.'))) {
                let href = part;
                // Add https:// if starts with www.
                if (part.startsWith('www.')) {
                    href = 'https://' + part;
                }
                return (
                    <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx('message-link')}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part ? <span key={index}>{part}</span> : null;
        });
    };

    /**
     * Handle paste event để paste ảnh
     */
    const handlePaste = useCallback((e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            e.preventDefault(); // Prevent default paste behavior

            if (selectedFiles.length + imageFiles.length > MAX_FILES) {
                toast.warning(`Chỉ được chọn tối đa ${MAX_FILES} file mỗi lần gửi`);
                return;
            }

            const newFiles = imageFiles.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
                fileType: FILE_TYPE.IMAGE,
                name: file.name || 'pasted-image.png'
            }));

            setSelectedFiles(prev => [...prev, ...newFiles]);
            toast.success(`Đã thêm ${imageFiles.length} ảnh`);
        }
    }, [selectedFiles.length]);

    /**
     * Xác định file type dựa trên MIME type
     */
    const getFileTypeFromMime = (mimeType) => {
        if (!mimeType) return FILE_TYPE.FILE;
        if (mimeType.startsWith('image/')) return FILE_TYPE.IMAGE;
        if (mimeType.startsWith('video/')) return FILE_TYPE.VIDEO;
        if (mimeType.startsWith('audio/')) return FILE_TYPE.AUDIO;
        return FILE_TYPE.FILE;
    };

    /**
     * Xác định file type label để hiển thị
     */
    const getFileTypeLabel = (fileType) => {
        switch (fileType) {
            case FILE_TYPE.IMAGE: return 'Ảnh';
            case FILE_TYPE.VIDEO: return 'Video';
            case FILE_TYPE.AUDIO: return 'Audio';
            case FILE_TYPE.FILE: return 'Tệp';
            default: return 'Tệp';
        }
    };

    /**
     * Handle chọn files từ file input
     */
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (selectedFiles.length + files.length > MAX_FILES) {
            toast.warning(`Chỉ được chọn tối đa ${MAX_FILES} file mỗi lần gửi`);
            return;
        }

        const newFiles = files.map((file) => {
            const fileType = getFileTypeFromMime(file.type);
            let preview = null;

            // Tạo preview URL cho ảnh và video
            if (fileType === FILE_TYPE.IMAGE || fileType === FILE_TYPE.VIDEO) {
                preview = URL.createObjectURL(file);
            }

            return { file, preview, fileType, name: file.name, size: file.size };
        });

        setSelectedFiles((prev) => [...prev, ...newFiles]);

        // Reset input để cho phép chọn lại cùng file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * Xóa một file đã chọn
     */
    const removeSelectedFile = (index) => {
        setSelectedFiles((prev) => {
            const updated = [...prev];
            // Revoke object URL để tránh memory leak
            if (updated[index].preview) {
                URL.revokeObjectURL(updated[index].preview);
            }
            updated.splice(index, 1);
            return updated;
        });
    };

    /**
     * Cleanup previews khi component unmount
     */
    useEffect(() => {
        return () => {
            selectedFiles.forEach((f) => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Gửi media message
     * 1. Upload files lên Cloudinary
     * 2. Gửi message qua WebSocket với attachments info
     */
    const handleSendMedia = async () => {
        if (selectedFiles.length === 0 || uploading || !conversation.id) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            // Upload tất cả files
            const uploadResults = await uploadService.uploadMultipleFiles(
                selectedFiles.map((f) => f.file),
                'chat',
                (progress) => setUploadProgress(progress),
            );

            // Build attachments array cho BE
            const attachments = uploadResults.map((result, index) => ({
                fileType: result.type || selectedFiles[index].fileType,
                fileUrl: result.url,
                fileName: result.fileName || selectedFiles[index].name,
                fileSize: Math.round((result.size || 0) * 1024), // BE trả về KB, convert sang bytes
            }));

            // Gửi media message qua WebSocket
            const messageData = {
                conversationId: conversation.id,
                content: inputValue.trim() || null, // Optional caption
                messageType: MESSAGE_TYPE.MEDIA,
                attachments,
            };

            if (onSendMessage) {
                onSendMessage(messageData);
            }

            // Optimistic update: thêm tin nhắn tạm
            const tempId = `temp-${Date.now()}`;
            const tempMessage = {
                id: tempId,
                _stableId: tempId,
                conversationId: conversation.id,
                content: inputValue.trim() || null,
                messageType: MESSAGE_TYPE.MEDIA,
                senderId: currentUserId,
                createdAt: new Date().toISOString(),
                isTemp: true,
                attachments: attachments.map((att, i) => ({
                    ...att,
                    // Dùng local preview cho optimistic update (ảnh/video hiển thị ngay)
                    fileUrl: selectedFiles[i].preview || att.fileUrl,
                    _uploadedUrl: att.fileUrl, // Lưu URL thật từ server
                })),
            };
            setMessages((prev) => [...prev, tempMessage]);

            // Cập nhật last message
            updateConversationLastMessage(conversation.id, {
                content: '[Media]',
                timestamp: new Date().toISOString(),
            });

            // Clear state
            selectedFiles.forEach((f) => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
            setSelectedFiles([]);
            setInputValue('');
        } catch (error) {
            console.error('Error sending media message:', error);
            
            // Lấy error message từ backend nếu có
            let errorMessage = 'Không thể gửi file. Vui lòng thử lại.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    /**
     * Gửi tin nhắn
     * - Nếu conversation.id tồn tại: gửi qua WebSocket như bình thường
     * - Nếu conversation.id = null: tạo conversation mới qua API rồi gửi tin nhắn đầu tiên
     */
    const handleSendMessage = async () => {
        // Nếu có files đang chọn → gửi media
        if (selectedFiles.length > 0) {
            await handleSendMedia();
            return;
        }

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
                // Tạo conversation mới, đồng thời lưu tin nhắn đầu tiên vào DB qua lastMessageText
                const createRes = await chatService.createDirectConversation({
                    userId: conversation.secondUserId,
                    lastMessageText: content,
                });

                if (!createRes) {
                    toast.error('Không thể tạo cuộc trò chuyện');
                    setInputValue(content);
                    return;
                }

                // Lấy conversationId từ response (BE trả về trong getDirectConversation sau)
                // vì createDirectConversation trả về Void, cần fetch lại conversation
                const directRes = await chatService.getDirectConversation(
                    { secondUserId: conversation.secondUserId },
                    0,
                    20
                );

                const conversationId =
                    directRes?.data?.content?.length > 0
                        ? directRes.data.content[0].conversationId
                        : null;

                if (!conversationId) {
                    toast.error('Không thể lấy thông tin cuộc trò chuyện');
                    setInputValue(content);
                    return;
                }

                const newConversation = {
                    ...conversation,
                    id: conversationId,
                };

                // Cập nhật conversationId + truyền initialMessages vào context
                // để component mới (sau remount do key đổi) nhận được messages ngay
                // mà không cần fetch lại từ API
                updateChatBoxConversation(conversation.secondUserId, newConversation, directRes.data);
                updateConversationLastMessage(conversationId, {
                    content,
                    timestamp: new Date().toISOString(),
                });

                // Fetch lại danh sách conversations để dropdown hiển thị đúng
                // (có đủ name, chatAvt từ BE)
                refreshConversations();
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
            messageType: MESSAGE_TYPE.TEXT,
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
     * Handle click vào header → focus chat box + mark as read
     */
    const handleHeaderClick = () => {
        if (isMinimized) {
            toggleMinimize(boxKey);
            // Mark as read khi expand từ minimize
            handleChatBoxInteraction();
        } else {
            focusChatBox(boxKey);
            handleChatBoxInteraction();
        }
    };

    return (
        <div 
            className={cx('chat-box', { minimized: isMinimized, 'has-unread': hasUnread && !isMinimized })}
            onClick={handleChatBoxInteraction}
        >
            {/* Nút close khi minimize - hiển thị khi hover */}
            {isMinimized && (
                <>
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
                    
                    {/* Badge hiển thị số tin chưa đọc khi minimize */}
                    {hasUnread && unreadCount > 0 && (
                        <span className={cx('unread-badge-minimized')}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </>
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
                                        {/* Render text content */}
                                        {message.content && (
                                            <div className={cx('message-content')}>
                                                {renderMessageContent(message.content)}
                                            </div>
                                        )}

                                        {/* Render media attachments */}
                                        {message.messageType === MESSAGE_TYPE.MEDIA && message.attachments && message.attachments.length > 0 && (
                                            <div className={cx('message-attachments', {
                                                'multiple': message.attachments.length > 1,
                                            })}>
                                                {message.attachments.map((att, idx) => (
                                                    <div key={idx} className={cx('attachment-item')}>
                                                        {att.fileType === FILE_TYPE.IMAGE && (
                                                            <img
                                                                src={att.fileUrl}
                                                                alt={att.fileName || 'Ảnh'}
                                                                className={cx('attachment-image')}
                                                                loading="lazy"
                                                                onClick={() => window.open(att.fileUrl, '_blank')}
                                                            />
                                                        )}
                                                        {att.fileType === FILE_TYPE.VIDEO && (
                                                            <div className={cx('video-wrapper')}>
                                                                <video
                                                                    src={att.fileUrl}
                                                                    controls
                                                                    className={cx('attachment-video')}
                                                                    preload="metadata"
                                                                />
                                                                <div className={cx('video-overlay')}>
                                                                    <svg className={cx('play-icon')} width="48" height="48" viewBox="0 0 24 24" fill="white">
                                                                        <path d="M8 5v14l11-7z"/>
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {att.fileType === FILE_TYPE.AUDIO && (
                                                            <AudioPlayer
                                                                src={att.fileUrl}
                                                                isOwnMessage={message.senderId === currentUserId}
                                                            />
                                                        )}
                                                        {att.fileType === FILE_TYPE.FILE && (
                                                            <div
                                                                className={cx('attachment-file')}
                                                                onClick={() => handleDownloadFile(att.fileUrl, att.fileName)}
                                                            >
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 3.5L18.5 8H14V3.5zM6 20V4h7v5h5v11H6z" />
                                                                </svg>
                                                                <div className={cx('file-info')}>
                                                                    <span className={cx('file-name')}>{att.fileName || 'Tệp đính kèm'}</span>
                                                                    {att.fileSize > 0 && (
                                                                        <span className={cx('file-size')}>
                                                                            {att.fileSize > 1024 * 1024
                                                                                ? `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                                                                : `${Math.round(att.fileSize / 1024)} KB`}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

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

                    {/* Upload progress bar */}
                    {uploading && (
                        <div className={cx('upload-progress-wrapper')}>
                            <div className={cx('upload-progress-bar')} style={{ width: `${uploadProgress}%` }} />
                            <span className={cx('upload-progress-text')}>Đang tải lên {uploadProgress}%</span>
                        </div>
                    )}

                    {/* File preview area */}
                    {selectedFiles.length > 0 && (
                        <div className={cx('file-preview-area')}>
                            {selectedFiles.map((fileObj, index) => (
                                <div key={index} className={cx('file-preview-item', {
                                    'video-preview': fileObj.fileType === FILE_TYPE.VIDEO,
                                    'audio-preview': fileObj.fileType === FILE_TYPE.AUDIO
                                })}>
                                    {fileObj.fileType === FILE_TYPE.IMAGE && fileObj.preview ? (
                                        <img src={fileObj.preview} alt={fileObj.name} className={cx('preview-thumb')} />
                                    ) : fileObj.fileType === FILE_TYPE.VIDEO && fileObj.preview ? (
                                        <div className={cx('preview-video-wrapper')}>
                                            <video src={fileObj.preview} className={cx('preview-video')} />
                                            <div className={cx('preview-video-overlay')}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    ) : fileObj.fileType === FILE_TYPE.AUDIO ? (
                                        <div className={cx('preview-audio-wrapper')}>
                                            <div className={cx('preview-audio-icon')}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                                </svg>
                                            </div>
                                            <span className={cx('preview-audio-name')}>{fileObj.name}</span>
                                        </div>
                                    ) : (
                                        <div className={cx('preview-file-icon')}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 3.5L18.5 8H14V3.5zM6 20V4h7v5h5v11H6z" />
                                            </svg>
                                            <span className={cx('preview-file-name')}>{fileObj.name}</span>
                                        </div>
                                    )}
                                    <button
                                        className={cx('preview-remove-btn')}
                                        onClick={() => removeSelectedFile(index)}
                                        aria-label="Xóa"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className={cx('input-wrapper')}>
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ACCEPTED_FILE_TYPES}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {/* Attachment button */}
                        <button
                            className={cx('attach-btn')}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            aria-label="Đính kèm file"
                            title="Đính kèm file"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.5 6v11.5a4 4 0 01-8 0V5a2.5 2.5 0 015 0v10.5a1 1 0 01-2 0V6h-1.5v9.5a2.5 2.5 0 005 0V5a4 4 0 00-8 0v12.5a5.5 5.5 0 0011 0V6H16.5z" />
                            </svg>
                        </button>

                        <input
                            type="text"
                            className={cx('input')}
                            placeholder="Aa"
                            value={inputValue}
                            onChange={handleInputChange}
                            onPaste={handlePaste}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            disabled={uploading}
                        />
                        <button
                            className={cx('send-btn')}
                            onClick={handleSendMessage}
                            disabled={(!inputValue.trim() && selectedFiles.length === 0) || sending || uploading}
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
