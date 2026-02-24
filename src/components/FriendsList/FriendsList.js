import { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import styles from './FriendsList.module.scss';
import userService from '~/services/userService';
import { useChatContext } from '~/contexts/ChatContext';
import { useAuth } from '~/contexts/AuthContext';
import chatService from '~/services/chatService';

const cx = classNames.bind(styles);

function FriendsList() {
    const { user, openAuthModal } = useAuth();
    const { openChatBox } = useChatContext();
    const navigate = useNavigate();

    // Friends state
    const [friends, setFriends] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState(null);

    // Suggestions state
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsPage, setSuggestionsPage] = useState(1);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [suggestionsHasMore, setSuggestionsHasMore] = useState(true);
    const [suggestionsError, setSuggestionsError] = useState(null);

    // Context menu state
    const [contextMenu, setContextMenu] = useState(null); // { x, y, suggestion }
    const contextMenuRef = useRef(null);

    // Search state
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const searchDebounceRef = useRef(null);

    // Track sent friend requests (set of user IDs)
    const [sentRequests, setSentRequests] = useState(new Set());

    // Ref for intersection observer
    const suggestionsObserver = useRef();

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                setContextMenu(null);
            }
        };
        if (contextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [contextMenu]);

    // Ref for last suggestion item
    const lastSuggestionElementRef = useCallback(
        (node) => {
            if (suggestionsLoading) return;
            if (suggestionsObserver.current) suggestionsObserver.current.disconnect();
            suggestionsObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && suggestionsHasMore) {
                    setSuggestionsPage((prevPage) => prevPage + 1);
                }
            });
            if (node) suggestionsObserver.current.observe(node);
        },
        [suggestionsLoading, suggestionsHasMore]
    );

    // Handle search with debounce
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchKeyword(value);
        setSearchError(null);

        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        searchDebounceRef.current = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const response = await userService.searchUsers(value.trim(), 0, 10);
                if (response && response.data) {
                    setSearchResults(response.data.content || []);
                }
            } catch (err) {
                console.error('Error searching users:', err);
                setSearchError('Không thể tìm kiếm người dùng');
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
    };

    const handleClearSearch = () => {
        setSearchKeyword('');
        setSearchResults([]);
        setSearchError(null);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };

    // Fetch friends (only if user is logged in)
    const fetchFriends = useCallback(async () => {
        if (!user) return;

        try {
            setFriendsLoading(true);
            setFriendsError(null);
            const response = await userService.getFriends();

            if (response && response.data) {
                // Backend returns List<UserModel>, not PageResponse
                const friendsList = Array.isArray(response.data) ? response.data : [];

                setFriends(friendsList);
            }
        } catch (err) {
            console.error('Error fetching friends:', err);
            setFriendsError('Không thể tải danh sách bạn bè');
        } finally {
            setFriendsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchFriends();
        }
    }, [user, fetchFriends]);

    // Fetch suggestions only when page changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                setSuggestionsLoading(true);
                setSuggestionsError(null);
                const response = await userService.getAllUsers(suggestionsPage, 10);

                if (response && response.data) {
                    // Backend returns PageResponse with 'content' field
                    const newSuggestions = response.data.content || [];
                    const totalPages = response.data.totalPages || 1;

                    setSuggestions((prev) => {
                        const combined = [...prev, ...newSuggestions];
                        // Remove duplicates based on id only
                        const unique = combined.filter(
                            (suggestion, index, self) =>
                                index === self.findIndex((s) => s.id === suggestion.id)
                        );
                        return unique;
                    });

                    setSuggestionsHasMore(suggestionsPage < totalPages);
                }
            } catch (err) {
                console.error('Error fetching suggestions:', err);
                setSuggestionsError('Không thể tải gợi ý kết bạn');
            } finally {
                setSuggestionsLoading(false);
            }
        };

        fetchSuggestions();
    }, [suggestionsPage]); // Only fetch when page changes

    const getFullName = (person) => {
        // ES trả về fullName, DB trả về firstName + lastName
        if (person.fullName) return person.fullName;
        return `${person.firstName || ''} ${person.lastName || ''}`.trim() || person.username;
    };

    const getAvatarUrl = (person) => {
        return person.avtUrl || 'https://via.placeholder.com/36';
    };

    // Filter suggestions to exclude current user and existing friends
    const filteredSuggestions = suggestions.filter(
        (s) => s.id !== user?.id && !friends.some((f) => f.id === s.id)
    );

    const handleFriendClick = async (friend) => {
        if (!user) {
            openAuthModal('login');
            return;
        }

        try {
            // Gọi API lấy direct conversation và messages
            const response = await chatService.getOrCreateDirectConversation(friend.id, {
                firstName: friend.firstName,
                lastName: friend.lastName,
                username: friend.username,
                avtUrl: friend.avtUrl,
            });

            if (response && response.data) {
                // Mở chatbox với conversation object và messages
                openChatBox(response.data, response.messages);
            }
        } catch (err) {
            console.error('Error opening chat with friend:', err);
            toast.error('Không thể mở cuộc trò chuyện');
        }
    };

    const handleSuggestionClick = (suggestion) => {
        // Left click → navigate to profile
        if (!suggestion.username) return;
        navigate(`/profile/${suggestion.username}`);
    };

    const handleSuggestionContextMenu = (e, suggestion) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, suggestion });
    };

    const handleContextAddFriend = async () => {
        const suggestion = contextMenu?.suggestion;
        setContextMenu(null);
        if (!suggestion) return;
        await handleAddFriend(suggestion);
    };

    const handleAddFriend = async (suggestion) => {
        if (!user) {
            openAuthModal('login');
            return;
        }
        if (sentRequests.has(suggestion.id)) return;
        try {
            const response = await userService.addFriend(suggestion.id);
            if (response) {
                toast.success(response.message || `Đã gửi lời mời kết bạn đến ${getFullName(suggestion)}`);
                setSentRequests((prev) => new Set(prev).add(suggestion.id));
            }
        } catch (err) {
            console.error('Error adding friend:', err);
            const errorMessage = err.response?.data?.message || 'Không thể gửi lời mời kết bạn';
            toast.error(errorMessage);
        }
    };

    const handleContextSendMessage = async () => {
        const suggestion = contextMenu?.suggestion;
        setContextMenu(null);
        if (!suggestion) return;
        if (!user) {
            openAuthModal('login');
            return;
        }
        try {
            const response = await chatService.getOrCreateDirectConversation(suggestion.id, {
                firstName: suggestion.firstName,
                lastName: suggestion.lastName,
                username: suggestion.username,
                avtUrl: suggestion.avtUrl,
            });
            if (response && response.data) {
                // Nếu chưa có conversation (id = null), truyền thêm secondUserId để ChatBox tạo mới khi gửi
                if (!response.data.id) {
                    response.data.secondUserId = suggestion.id;
                }
                openChatBox(response.data, response.messages);
            }
        } catch (err) {
            console.error('Error opening chat:', err);
            toast.error('Không thể mở cuộc trò chuyện');
        }
    };

    const handleContextViewProfile = () => {
        const suggestion = contextMenu?.suggestion;
        setContextMenu(null);
        if (!suggestion?.username) return;
        navigate(`/profile/${suggestion.username}`);
    };

    const handleLoginClick = () => {
        openAuthModal('login');
    };

    return (
        <>
        <div className={cx('wrapper')}>
            {/* Search Section */}
            <div className={cx('section', 'searchSection')}>
                <div className={cx('searchInputWrapper')}>
                    <svg className={cx('searchIcon')} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className={cx('searchInput')}
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchKeyword}
                        onChange={handleSearchChange}
                    />
                    {searchKeyword && (
                        <button className={cx('searchClearBtn')} onClick={handleClearSearch} title="Xóa">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {searchKeyword.trim() && (
                    <div className={cx('searchResults')}>
                        {searchLoading && (
                            <div className={cx('loading')}>Đang tìm kiếm...</div>
                        )}
                        {searchError && !searchLoading && (
                            <div className={cx('error')}>{searchError}</div>
                        )}
                        {!searchLoading && !searchError && searchResults.length === 0 && (
                            <div className={cx('empty', 'searchEmpty')}>Không tìm thấy người dùng nào</div>
                        )}
                        {!searchLoading && searchResults.length > 0 && (
                            <div className={cx('friendsList')}>
                                {searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className={cx('suggestionItem')}
                                        onClick={() => handleSuggestionClick(result)}
                                        onContextMenu={(e) => handleSuggestionContextMenu(e, result)}
                                    >
                                        <div className={cx('avatarWrapper')}>
                                            <img
                                                src={getAvatarUrl(result)}
                                                alt={getFullName(result)}
                                                className={cx('avatar')}
                                            />
                                        </div>
                                        <div className={cx('friendInfo')}>
                                            <p className={cx('friendName')}>{getFullName(result)}</p>
                                            <p className={cx('friendStatus')}>@{result.username}</p>
                                        </div>
                                        {user && result.id !== user?.id && (
                                            sentRequests.has(result.id) || friends.some((f) => f.id === result.id) ? (
                                                <button
                                                    className={cx('addButton', 'addButtonSent')}
                                                    disabled
                                                    title={friends.some((f) => f.id === result.id) ? 'Đã là bạn bè' : 'Đã gửi lời mời'}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    className={cx('addButton')}
                                                    onClick={(e) => { e.stopPropagation(); handleAddFriend(result); }}
                                                    title="Gửi lời mời kết bạn"
                                                >
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                        <circle cx="8.5" cy="7" r="4" />
                                                        <line x1="20" y1="8" x2="20" y2="14" />
                                                        <line x1="23" y1="11" x2="17" y2="11" />
                                                    </svg>
                                                </button>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Friends Section */}
            <div className={cx('section')}>
                <div className={cx('header')}>
                    <h3>Bạn bè</h3>
                    {user && <span className={cx('count')}>({friends.length})</span>}
                </div>

                {!user ? (
                    <div className={cx('loginPrompt')}>
                        <p className={cx('promptText')}>Đăng nhập để trò chuyện với bạn bè</p>
                        <button className={cx('loginButton')} onClick={handleLoginClick}>
                            Đăng nhập
                        </button>
                    </div>
                ) : friendsError ? (
                    <div className={cx('error')}>{friendsError}</div>
                ) : (
                    <>
                        {friends.length === 0 && !friendsLoading ? (
                            <div className={cx('empty')}>Chưa có bạn bè nào</div>
                        ) : (
                            <div className={cx('friendsList')}>
                                {friends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className={cx('friendItem')}
                                        onClick={() => handleFriendClick(friend)}
                                    >
                                        <div className={cx('avatarWrapper')}>
                                            <img
                                                src={getAvatarUrl(friend)}
                                                alt={getFullName(friend)}
                                                className={cx('avatar')}
                                            />
                                        </div>
                                        <div className={cx('friendInfo')}>
                                            <p className={cx('friendName')}>
                                                {getFullName(friend)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {friendsLoading && (
                            <div className={cx('loading')}>Đang tải...</div>
                        )}
                    </>
                )}
            </div>

            {/* Suggestions Section */}
            <div className={cx('section')}>
                <div className={cx('header')}>
                    <h3>Gợi ý kết bạn</h3>
                </div>

                {suggestionsError ? (
                    <div className={cx('error')}>{suggestionsError}</div>
                ) : (
                    <>
                        {filteredSuggestions.length === 0 && !suggestionsLoading ? (
                            <div className={cx('empty')}>Không có gợi ý nào</div>
                        ) : (
                            <div className={cx('friendsList')}>
                                {filteredSuggestions.map((suggestion, index) => {
                                    const isLast = index === filteredSuggestions.length - 1;
                                    return (
                                        <div
                                            key={suggestion.id}
                                            ref={isLast ? lastSuggestionElementRef : null}
                                            className={cx('suggestionItem')}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            onContextMenu={(e) => handleSuggestionContextMenu(e, suggestion)}
                                        >
                                            <div className={cx('avatarWrapper')}>
                                                <img
                                                    src={getAvatarUrl(suggestion)}
                                                    alt={getFullName(suggestion)}
                                                    className={cx('avatar')}
                                                />
                                            </div>
                                            <div className={cx('friendInfo')}>
                                                <p className={cx('friendName')}>
                                                    {getFullName(suggestion)}
                                                </p>
                                            </div>
                                            {user && (
                                                sentRequests.has(suggestion.id) ? (
                                                    <button
                                                        className={cx('addButton', 'addButtonSent')}
                                                        disabled
                                                        title="Đã gửi lời mời kết bạn"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={cx('addButton')}
                                                        onClick={(e) => { e.stopPropagation(); handleAddFriend(suggestion); }}
                                                        title="Gửi lời mời kết bạn"
                                                    >
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                            <circle cx="8.5" cy="7" r="4" />
                                                            <line x1="20" y1="8" x2="20" y2="14" />
                                                            <line x1="23" y1="11" x2="17" y2="11" />
                                                        </svg>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {suggestionsLoading && (
                            <div className={cx('loading')}>Đang tải...</div>
                        )}
                    </>
                )}
            </div>
        </div>

            {/* Context menu for suggestions */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className={cx('contextMenu')}
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button className={cx('contextMenuItem')} onClick={handleContextAddFriend}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Kết bạn
                    </button>
                    <button className={cx('contextMenuItem')} onClick={handleContextSendMessage}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Gửi tin nhắn
                    </button>
                    <button className={cx('contextMenuItem')} onClick={handleContextViewProfile}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Xem trang cá nhân
                    </button>
                </div>
            )}
        </>
    );
}

export default FriendsList;
