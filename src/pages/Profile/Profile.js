import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, 
  faCommentDots, 
  faUserPlus,
  faUserCheck,
  faClock,
  faPen,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faTwitter, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';
import classNames from 'classnames';
import { toast } from 'react-toastify';

import styles from './Profile.module.scss';
import userService from '~/services/userService';
import chatService from '~/services/chatService';
import { useChatContext } from '~/contexts/ChatContext';
import { useAuth } from '~/contexts/AuthContext';

const Profile = () => {
  const { username: rawUsername } = useParams();
  const { user: currentUser } = useAuth();
  const { openChatBox } = useChatContext();

  // Strip @ prefix từ URL param (ví dụ: /@hungdo -> hungdo)
  const profileUsername = rawUsername?.startsWith('@') ? rawUsername.slice(1) : rawUsername;

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Friendship
  const [friendshipStatus, setFriendshipStatus] = useState('NONE'); // NONE | SENT | WAITING | ACCEPTED | REJECTED | SELF
  const [friendshipRequestId, setFriendshipRequestId] = useState(null);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  // Conversations (chỉ hiển thị cho profile của bản thân)
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // Settings (chỉ hiển thị cho profile của bản thân)
  const [settings, setSettings] = useState({
    emailFollows: true,
    emailAnswers: false,
    emailMentions: true,
    newLaunches: false,
    monthlyUpdates: true,
    subscribeNewsletter: false,
  });

  // Fetch profile data
  useEffect(() => {
    // Chờ AuthContext load xong (currentUser !== undefined)
    // Nếu AuthContext đang loading thì chưa fetch
    if (currentUser === undefined) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Kiểm tra xem đây là profile của bản thân hay người khác
        const isSelf = !profileUsername || (currentUser && currentUser.username === profileUsername);
        setIsOwnProfile(isSelf);

        if (isSelf) {
          // Xem profile bản thân - dùng luôn currentUser từ AuthContext
          if (currentUser) {
            setProfileUser(currentUser);
            setFriendshipStatus('SELF');
          }
          setLoading(false);
          return;
        }

        // Xem profile người khác - chỉ gọi API getUserByUsername + getFriendshipStatus
        const userResponse = await userService.getUserByUsername(profileUsername);

        if (userResponse?.data) {
          setProfileUser(userResponse.data);

          // Lấy trạng thái kết bạn bằng id của user vừa tìm được
          const statusResponse = await userService.getFriendshipStatus(userResponse.data.id);
          if (statusResponse?.data !== undefined) {
            setFriendshipStatus(statusResponse.data.status);
            setFriendshipRequestId(statusResponse.data.requestId || null);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUsername, currentUser?.username]);

  // Fetch conversations (chỉ khi xem profile bản thân)
  useEffect(() => {
    if (!isOwnProfile) return;

    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const response = await chatService.getUserConversations(0, 5);
        if (response?.data?.content) {
          setConversations(response.data.content);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, [isOwnProfile]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConversationClick = (conversation) => {
    openChatBox(conversation);
  };

  // Gửi lời mời kết bạn
  const handleAddFriend = useCallback(async () => {
    if (!profileUser?.id) return;
    setFriendActionLoading(true);
    try {
      await userService.addFriend(profileUser.id);
      setFriendshipStatus('SENT');
      setFriendshipRequestId(null);
      toast.success('Đã gửi lời mời kết bạn!');
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Không thể gửi lời mời kết bạn');
    } finally {
      setFriendActionLoading(false);
    }
  }, [profileUser]);

  // Phản hồi lời mời kết bạn (chấp nhận hoặc từ chối)
  const handleRespondFriendRequest = useCallback(async (isAccept) => {
    if (!friendshipRequestId) return;
    setFriendActionLoading(true);
    try {
      await userService.respondToFriendRequest(friendshipRequestId, isAccept);
      if (isAccept) {
        setFriendshipStatus('ACCEPTED');
        toast.success('Đã chấp nhận lời mời kết bạn!');
      } else {
        setFriendshipStatus('REJECTED');
        setFriendshipRequestId(null);
        toast.info('Đã từ chối lời mời kết bạn');
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast.error('Không thể phản hồi lời mời kết bạn');
    } finally {
      setFriendActionLoading(false);
    }
  }, [friendshipRequestId]);

  // Nhắn tin cho user
  const handleSendMessage = useCallback(async () => {
    if (!profileUser) return;
    try {
      const result = await chatService.getOrCreateDirectConversation(
        profileUser.id,
        {
          firstName: profileUser.firstName,
          lastName: profileUser.lastName,
          avtUrl: profileUser.avtUrl,
          username: profileUser.username,
        }
      );
      if (result?.data) {
        openChatBox(result.data, result.messages);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Không thể mở cuộc trò chuyện');
    }
  }, [profileUser, openChatBox]);

  // Render action buttons dựa vào isOwnProfile và friendshipStatus
  const renderActionButtons = () => {
    if (isOwnProfile) {
      // Profile bản thân
      return (
        <div className={styles.actionButtons}>
          <button className={styles.btn} onClick={() => toast.info('Tính năng chỉnh sửa đang phát triển')}>
            <FontAwesomeIcon icon={faPen} /> Chỉnh sửa
          </button>
          <button className={styles.btn} onClick={() => toast.info('Tính năng cài đặt đang phát triển')}>
            <FontAwesomeIcon icon={faCog} /> Cài đặt
          </button>
        </div>
      );
    }

    // Profile người khác
    return (
      <div className={styles.actionButtons}>
        {renderFriendButton()}
        <button className={styles.btn} onClick={handleSendMessage}>
          <FontAwesomeIcon icon={faCommentDots} /> Nhắn tin
        </button>
      </div>
    );
  };

  // Render nút kết bạn dựa vào trạng thái
  const renderFriendButton = () => {
    switch (friendshipStatus) {
      case 'ACCEPTED':
        return (
          <button className={classNames(styles.btn, styles.btnFriend)}>
            <FontAwesomeIcon icon={faUserCheck} /> Bạn bè
          </button>
        );
      case 'SENT':
        return (
          <button className={classNames(styles.btn, styles.btnPending)} disabled>
            <FontAwesomeIcon icon={faClock} /> Đã gửi lời mời
          </button>
        );
      case 'WAITING':
        return (
          <div className={styles.respondButtons}>
            <button
              className={classNames(styles.btn, styles.btnAccept)}
              onClick={() => handleRespondFriendRequest(true)}
              disabled={friendActionLoading}
            >
              <FontAwesomeIcon icon={faCheck} />
              {friendActionLoading ? 'Đang xử lý...' : 'Chấp nhận'}
            </button>
            <button
              className={classNames(styles.btn, styles.btnReject)}
              onClick={() => handleRespondFriendRequest(false)}
              disabled={friendActionLoading}
            >
              <FontAwesomeIcon icon={faTimes} /> Từ chối
            </button>
          </div>
        );
      case 'REJECTED':
      case 'NONE':
      default:
        return (
          <button 
            className={classNames(styles.btn, styles.btnAddFriend)} 
            onClick={handleAddFriend}
            disabled={friendActionLoading}
          >
            <FontAwesomeIcon icon={faUserPlus} /> 
            {friendActionLoading ? 'Đang gửi...' : 'Kết bạn'}
          </button>
        );
    }
  };

  return (
    <div className={styles.profilePage}>
      
      {/* Header Image */}
      <div className={styles.headerBg}>
        <div className={styles.headerOverlay}></div>
      </div>

      {/* Floating Profile Header Card */}
      <div className={styles.profileCardContainer}>
        <div className={styles.profileHeaderCard}>
          <div className={styles.userInfo}>
            {loading ? (
              <div className={styles.avatarSkeleton}></div>
            ) : (
              <img 
                src={profileUser?.avtUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                alt="Avatar" 
                className={styles.avatar}
              />
            )}
            <div className={styles.userDetails}>
              <h2>{profileUser ? `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() || profileUser.username : 'Đang tải...'}</h2>
              <p>{profileUser?.username ? `@${profileUser.username}` : '@username'}</p>
            </div>
          </div>

          {!loading && renderActionButtons()}
        </div>
      </div>

      {/* Lưới nội dung chính */}
      <div className={classNames(styles.contentGrid, { [styles.twoColumns]: !isOwnProfile })}>
        
        {/* Cột 1: Cài đặt nền tảng (chỉ hiển thị cho bản thân) */}
        {isOwnProfile && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Cài đặt nền tảng</h3>
            <div className={styles.settingsGroup}>
              <span className={styles.sectionLabel}>Tài khoản</span>
              <SwitchItem 
                label="Gửi email khi có người theo dõi bạn" 
                checked={settings.emailFollows} 
                onChange={() => toggleSetting('emailFollows')} 
              />
              <SwitchItem 
                label="Gửi email khi ai đó trả lời bài viết của bạn" 
                checked={settings.emailAnswers} 
                onChange={() => toggleSetting('emailAnswers')} 
              />
              <SwitchItem 
                label="Gửi email khi ai đó nhắc đến bạn" 
                checked={settings.emailMentions} 
                onChange={() => toggleSetting('emailMentions')} 
              />
            </div>
            <div className={styles.settingsGroup}>
              <span className={styles.sectionLabel}>Ứng dụng</span>
              <SwitchItem 
                label="Thông báo dự án và sản phẩm mới" 
                checked={settings.newLaunches} 
                onChange={() => toggleSetting('newLaunches')} 
              />
              <SwitchItem 
                label="Thông báo cập nhật hàng tháng" 
                checked={settings.monthlyUpdates} 
                onChange={() => toggleSetting('monthlyUpdates')} 
              />
              <SwitchItem 
                label="Đăng ký nhận bản tin" 
                checked={settings.subscribeNewsletter} 
                onChange={() => toggleSetting('subscribeNewsletter')} 
              />
            </div>
          </div>
        )}

        {/* Cột 2: Thông tin cá nhân */}
        <div className={styles.card}>
          <div className={styles.headerRow}>
            <h3 className={classNames(styles.cardTitle, 'mb-0')} style={{marginBottom: 0}}>
                Thông tin cá nhân
            </h3>
            {isOwnProfile && (
              <FontAwesomeIcon icon={faPen} className={styles.editIcon} />
            )}
          </div>
          <p className={styles.profileDesc}>
            {isOwnProfile 
              ? `Xin chào, mình là ${profileUser ? `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() || profileUser.username : '...'}. Quyết định: Nếu bạn không thể quyết định, câu trả lời là không. Nếu có hai con đường khó như nhau, hãy chọn con đường đau đớn hơn trong ngắn hạn (tránh đau đớn chỉ tạo ra ảo giác về sự công bằng).`
              : `Đây là trang cá nhân của ${profileUser ? `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() || profileUser.username : '...'}.`
            }
          </p>
          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Họ tên:</span>
              <span className={styles.infoValue}>{profileUser ? `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() || 'Chưa cập nhật' : 'Đang tải...'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Username:</span>
              <span className={styles.infoValue}>{profileUser?.username || 'Đang tải...'}</span>
            </div>
            {/* Email chỉ hiển thị cho bản thân */}
            {isOwnProfile && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{profileUser?.email || 'Chưa cập nhật'}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ngày sinh:</span>
              <span className={styles.infoValue}>{profileUser?.dob || 'Chưa cập nhật'}</span>
            </div>
            <div className={classNames(styles.infoRow, 'items-center')} style={{alignItems: 'center'}}>
              <span className={styles.infoLabel}>Mạng xã hội:</span>
              <div className={styles.socialIcons}>
                <FontAwesomeIcon icon={faFacebookF} className={styles.socialIcon} />
                <FontAwesomeIcon icon={faTwitter} className={styles.socialIcon} />
                <FontAwesomeIcon icon={faInstagram} className={styles.socialIcon} />
              </div>
            </div>
          </div>
        </div>

        {/* Cột 3: Tin nhắn (chỉ hiển thị cho bản thân) */}
        {isOwnProfile && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Tin nhắn</h3>
            <div className={styles.conversationsList}>
              {loadingConversations ? (
                <div className={styles.loading}>Đang tải...</div>
              ) : conversations.length === 0 ? (
                <div className={styles.empty}>Chưa có tin nhắn nào</div>
              ) : (
                conversations.map((conversation) => {
                  const formatTime = (dateTime) => {
                    if (!dateTime) return '';
                    const messageDate = new Date(dateTime);
                    const now = new Date();
                    const diffMs = now - messageDate;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    const diffDays = Math.floor(diffHours / 24);

                    if (diffMins < 1) return 'Vừa xong';
                    if (diffMins < 60) return `${diffMins} phút`;
                    if (diffHours < 24) return `${diffHours} giờ`;
                    if (diffDays === 1) return 'Hôm qua';
                    if (diffDays < 7) return `${diffDays} ngày`;
                    
                    return messageDate.toLocaleDateString('vi-VN');
                  };

                  const truncateText = (text, maxLength = 50) => {
                    if (!text) return 'Bắt đầu trò chuyện';
                    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
                  };

                  return (
                    <div 
                      key={conversation.id} 
                      className={styles.conversationItem}
                      onClick={() => handleConversationClick(conversation)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.convoLeft}>
                        <img 
                          src={conversation.chatAvt || "https://i.pravatar.cc/150?u=" + conversation.id} 
                          alt={conversation.name} 
                          className={styles.convoAvatar} 
                        />
                        <div className={styles.convoInfo}>
                          <h4>{conversation.name || 'Người dùng'}</h4>
                          <p>{truncateText(conversation.lastMessageText)}</p>
                        </div>
                      </div>
                      <div className={styles.convoRight}>
                        <span className={styles.time}>{formatTime(conversation.lastMessageTime)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Nếu xem profile người khác, hiển thị card bạn chung (placeholder) */}
        {!isOwnProfile && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Thông tin thêm</h3>
            <div className={styles.extraInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Trạng thái:</span>
                <span className={styles.infoValue}>
                  {friendshipStatus === 'ACCEPTED' && '🤝 Bạn bè'}
                  {friendshipStatus === 'SENT' && '⏳ Đã gửi lời mời kết bạn'}
                  {friendshipStatus === 'WAITING' && '🔔 Đang chờ bạn phản hồi'}
                  {friendshipStatus === 'NONE' && '👤 Chưa kết bạn'}
                  {friendshipStatus === 'REJECTED' && '👤 Chưa kết bạn'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tham gia:</span>
                <span className={styles.infoValue}>Thành viên của MyAnime</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component Switch Toggle (Tái sử dụng)
const SwitchItem = ({ label, checked, onChange }) => (
  <div className={styles.settingItem}>
    <span className={styles.settingLabel}>{label}</span>
    <label className={styles.switch}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className={styles.slider}></span>
    </label>
  </div>
);

export default Profile;