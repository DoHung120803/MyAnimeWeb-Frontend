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
     */
    const openChatBox = useCallback((conversation) => {
        setOpenChatBoxes((prev) => {
            // Kiểm tra đã mở chưa
            const existingIndex = prev.findIndex(
                (chatBox) => chatBox.conversationId === conversation.id
            );

            // Nếu đã mở → đưa lên đầu (focus) và expand nếu đang minimize
            if (existingIndex !== -1) {
                const updated = [...prev];
                const [existing] = updated.splice(existingIndex, 1);
                return [{ ...existing, isMinimized: false }, ...updated];
            }

            // Nếu chưa mở → thêm vào đầu danh sách
            const newChatBox = {
                conversationId: conversation.id,
                conversation: conversation,
                isMinimized: false,
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
