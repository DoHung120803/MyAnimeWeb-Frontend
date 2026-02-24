import React, { createContext, useContext, useState, useCallback } from 'react';

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

            // Kiểm tra đã mở chưa (so sánh theo id hoặc secondUserId)
            const existingIndex = prev.findIndex((chatBox) => {
                if (conversation.id) {
                    return chatBox.conversationId === conversation.id;
                }
                return chatBox.conversationId === boxKey;
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
     */
    const updateConversations = useCallback((newConversations) => {
        setConversations(newConversations);
    }, []);

    /**
     * Cập nhật conversationId và conversation object cho một chat box (sau khi tạo mới)
     * @param {string|null} secondUserId - secondUserId của conversation mới (dùng để tìm boxKey)
     * @param {object} newConversation - Conversation mới với id thật
     */
    const updateChatBoxConversation = useCallback((secondUserId, newConversation) => {
        const tempKey = `new-${secondUserId}`;
        setOpenChatBoxes((prev) =>
            prev.map((chatBox) =>
                chatBox.conversationId === tempKey
                    ? { ...chatBox, conversationId: newConversation.id, conversation: newConversation }
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
                // Conversation không có trong danh sách, có thể cần fetch lại hoặc thêm mới
                console.log('Conversation not found in list:', conversationId);
                return prev;
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
        updateConversationLastMessage,
        updateChatBoxConversation,
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
