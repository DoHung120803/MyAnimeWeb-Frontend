import React, { createContext, useContext, useState, useCallback } from 'react';
import chatService from '~/services/chatService';

const ChatContext = createContext();

/**
 * Context để quản lý danh sách chat boxes đang mở
 * Giống Facebook Messenger Web
 */
export const ChatProvider = ({ children }) => {
    // Danh sách conversation đang mở
    // Mỗi item: { conversationId, conversation, isMinimized }
    const [openChatBoxes, setOpenChatBoxes] = useState([]);
    
    // Danh sách tất cả conversations (cho dropdown)
    const [conversations, setConversations] = useState([]);

    // Tổng số tin nhắn chưa đọc (hiển thị trên MessageIcon badge)
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    // ChatBox đang được user focus (click vào) - chỉ chatbox này mới được markAsRead
    const [focusedChatBoxId, setFocusedChatBoxId] = useState(null);
    
    // Cài đặt âm thanh thông báo
    const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
        // Lấy từ localStorage nếu có
        const saved = localStorage.getItem('chatSoundEnabled');
        return saved !== null ? JSON.parse(saved) : true; // Mặc định bật
    });
    
    // Giới hạn số chat boxes tối đa
    const MAX_CHAT_BOXES = 3;

    /**
     * Mở một chat box mới
     * - Nếu đã mở → focus vào chat box đó
     * - Nếu chưa mở → thêm vào danh sách
     * - Nếu vượt quá giới hạn → đóng chat box cũ nhất (đầu tiên trong mảng)
     * @param {object} conversation - Conversation object
     * @param {object} initialMessages - Messages ban đầu (optional)
     */
    const openChatBox = useCallback((conversation, initialMessages = null) => {
        setOpenChatBoxes((prev) => {
            // Tạo key: nếu có id thì dùng id, không thì dùng secondUserId (trường hợp conversation mới)
            const boxKey = conversation.id ?? `new-${conversation.secondUserId}`;

            // Kiểm tra đã mở chưa:
            // - Nếu có id → tìm theo conversationId thật
            // - Nếu chưa có id → tìm theo tempKey "new-{secondUserId}" HOẶC
            //   theo conversationId thật (trường hợp đã tạo rồi, key đã đổi)
            const existingIndex = prev.findIndex((chatBox) => {
                if (conversation.id) {
                    return chatBox.conversationId === conversation.id;
                }
                // Chưa có id: kiểm tra cả tempKey lẫn trường hợp đã được tạo trước đó
                return (
                    chatBox.conversationId === boxKey ||
                    chatBox.conversation?.secondUserId === conversation.secondUserId
                );
            });

            // Nếu đã mở → đưa lên đầu (focus) và expand nếu đang minimize
            if (existingIndex !== -1) {
                const updated = [...prev];
                const [existing] = updated.splice(existingIndex, 1);
                return [{ ...existing, isMinimized: false }, ...updated];
            }

            // Nếu chưa mở → thêm vào đầu danh sách
            const newChatBox = {
                conversationId: boxKey,
                conversation: conversation,
                isMinimized: false,
                initialMessages: initialMessages, // Thêm messages ban đầu
            };

            let updated = [newChatBox, ...prev];

            // Nếu vượt quá giới hạn → xóa chat box cũ nhất (cuối mảng)
            if (updated.length > MAX_CHAT_BOXES) {
                updated = updated.slice(0, MAX_CHAT_BOXES);
            }

            return updated;
        });
    }, []);

    /**
     * Đóng một chat box
     */
    const closeChatBox = useCallback((conversationId) => {
        setOpenChatBoxes((prev) =>
            prev.filter((chatBox) => chatBox.conversationId !== conversationId)
        );
        // Clear focused nếu chatbox đang focused bị đóng
        setFocusedChatBoxId((prev) => prev === conversationId ? null : prev);
    }, []);

    /**
     * Minimize/Expand một chat box
     */
    const toggleMinimize = useCallback((conversationId) => {
        setOpenChatBoxes((prev) =>
            prev.map((chatBox) =>
                chatBox.conversationId === conversationId
                    ? { ...chatBox, isMinimized: !chatBox.isMinimized }
                    : chatBox
            )
        );
    }, []);

    /**
     * Focus vào một chat box (đưa lên đầu danh sách)
     */
    const focusChatBox = useCallback((conversationId) => {
        setOpenChatBoxes((prev) => {
            const index = prev.findIndex(
                (chatBox) => chatBox.conversationId === conversationId
            );
            if (index === -1 || index === 0) return prev;

            const updated = [...prev];
            const [chatBox] = updated.splice(index, 1);
            return [chatBox, ...updated];
        });
    }, []);

    /**
     * Bật/tắt âm thanh thông báo
     */
    const toggleSound = useCallback(() => {
        setIsSoundEnabled((prev) => {
            const newValue = !prev;
            localStorage.setItem('chatSoundEnabled', JSON.stringify(newValue));
            return newValue;
        });
    }, []);

    /**
     * Cập nhật danh sách conversations
     * Đồng thời tính lại totalUnreadCount từ danh sách mới
     */
    const updateConversations = useCallback((newConversations) => {
        setConversations(newConversations);
        // Tính tổng unreadCount từ danh sách conversations
        const total = newConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setTotalUnreadCount(total);
    }, []);

    /**
     * Fetch lại toàn bộ danh sách conversations từ API và cập nhật context
     * Dùng sau khi tạo conversation mới để dropdown hiển thị đúng
     */
    const refreshConversations = useCallback(async () => {
        try {
            const response = await chatService.getUserConversations(0, 20);
            if (response.data && response.data.content) {
                const convs = response.data.content;
                setConversations(convs);
                const total = convs.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
                setTotalUnreadCount(total);
            }
        } catch (err) {
            console.error('Failed to refresh conversations:', err);
        }
    }, []);

    /**
     * Cập nhật conversationId và conversation object cho một chat box (sau khi tạo mới)
     * @param {string|null} secondUserId - secondUserId của conversation mới (dùng để tìm boxKey)
     * @param {object} newConversation - Conversation mới với id thật
     * @param {object|null} initialMessages - Messages ban đầu để tránh fetch lại sau remount
     */
    const updateChatBoxConversation = useCallback((secondUserId, newConversation, initialMessages = null) => {
        const tempKey = `new-${secondUserId}`;
        setOpenChatBoxes((prev) =>
            prev.map((chatBox) =>
                chatBox.conversationId === tempKey
                    ? {
                          ...chatBox,
                          conversationId: newConversation.id,
                          conversation: newConversation,
                          ...(initialMessages !== null && { initialMessages }),
                      }
                    : chatBox
            )
        );
    }, []);

    /**
     * Cập nhật lastMessage và lastMessageTime cho một conversation
     * Được gọi khi gửi hoặc nhận tin nhắn mới
     */
    const updateConversationLastMessage = useCallback((conversationId, message) => {
        setConversations((prev) => {
            // Tìm conversation cần update
            const index = prev.findIndex(conv => conv.id === conversationId);
            
            if (index === -1) {
                // Conversation không có trong danh sách → thêm mới vào đầu
                // (trường hợp vừa tạo conversation mới)
                const newConv = {
                    id: conversationId,
                    lastMessageText: message.content || message.text || '',
                    lastMessageTime: message.timestamp || message.createdAt || new Date().toISOString(),
                };
                return [newConv, ...prev];
            }

            // Tạo bản sao và cập nhật
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                lastMessageText: message.content || message.text || '',
                lastMessageTime: message.timestamp || message.createdAt || new Date().toISOString(),
            };

            // Đưa conversation này lên đầu danh sách (conversation mới nhất)
            const [updatedConv] = updated.splice(index, 1);
            return [updatedConv, ...updated];
        });
    }, []);

    /**
     * Fetch tổng số tin nhắn chưa đọc từ API
     */
    const fetchTotalUnreadCount = useCallback(async () => {
        try {
            const response = await chatService.getTotalUnreadCount();
            if (response.data !== undefined && response.data !== null) {
                setTotalUnreadCount(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch total unread count:', err);
        }
    }, []);

    /**
     * Đánh dấu conversation đã đọc
     * - Gọi API markAsRead
     * - Cập nhật unreadCount trong conversations list
     * - Giảm totalUnreadCount
     * @param {Long} conversationId 
     * @param {Long} lastReadMessageId - ID của tin nhắn cuối cùng đã đọc
     */
    const markConversationAsRead = useCallback(async (conversationId, lastReadMessageId) => {
        if (!conversationId || !lastReadMessageId) return;

        try {
            await chatService.markAsRead({ conversationId, lastReadMessageId });
            
            // Cập nhật unreadCount trong conversations list
            setConversations((prev) => {
                return prev.map(conv => {
                    if (conv.id === conversationId) {
                        const oldUnread = conv.unreadCount || 0;
                        // Giảm totalUnreadCount tương ứng
                        if (oldUnread > 0) {
                            setTotalUnreadCount(prev => Math.max(0, prev - oldUnread));
                        }
                        return { ...conv, unreadCount: 0 };
                    }
                    return conv;
                });
            });
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }, []);

    /**
     * Tăng unreadCount cho một conversation khi nhận tin nhắn mới
     * (chỉ tăng nếu chat box của conversation đó KHÔNG đang mở hoặc đang minimize)
     * @param {Long} conversationId
     */
    const incrementUnreadForConversation = useCallback((conversationId) => {
        setConversations((prev) => {
            return prev.map(conv => {
                if (conv.id === conversationId) {
                    return { ...conv, unreadCount: (conv.unreadCount || 0) + 1 };
                }
                return conv;
            });
        });
        setTotalUnreadCount(prev => prev + 1);
    }, []);

    const value = {
        openChatBoxes,
        openChatBox,
        closeChatBox,
        toggleMinimize,
        focusChatBox,
        isSoundEnabled,
        toggleSound,
        conversations,
        updateConversations,
        refreshConversations,
        updateConversationLastMessage,
        updateChatBoxConversation,
        totalUnreadCount,
        setTotalUnreadCount,
        fetchTotalUnreadCount,
        markConversationAsRead,
        incrementUnreadForConversation,
        focusedChatBoxId,
        setFocusedChatBoxId,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

/**
 * Hook để sử dụng ChatContext
 */
export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};

export default ChatContext;
