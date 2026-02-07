import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, 
  faCommentDots, 
  faCube, 
  faPen, 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faTwitter, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';
import classNames from 'classnames';

// Import module styles
import styles from './Profile.module.scss';

const Profile = () => {
  // State giả lập cho Settings
  const [settings, setSettings] = useState({
    emailFollows: true,
    emailAnswers: false,
    emailMentions: true,
    newLaunches: false,
    monthlyUpdates: true,
    subscribeNewsletter: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const conversations = [
    { id: 1, name: "Sophie B.", msg: "Hi! I need more information...", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "Anne Marie", msg: "Awesome work, can you...", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: 3, name: "Ivanna", msg: "About files I can...", avatar: "https://i.pravatar.cc/150?u=3" },
    { id: 4, name: "Peterson", msg: "Have a great afternoon...", avatar: "https://i.pravatar.cc/150?u=4" },
    { id: 5, name: "Nick Daniel", msg: "Hi! I need more information...", avatar: "https://i.pravatar.cc/150?u=5" },
  ];

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
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Avatar" 
              className={styles.avatar}
            />
            <div className={styles.userDetails}>
              <h2>Alex Thompson</h2>
              <p>CEO / Co-Founder</p>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.btn}>
              <FontAwesomeIcon icon={faCube} /> App
            </button>
            <button className={styles.btn}>
              <FontAwesomeIcon icon={faCommentDots} /> Message
            </button>
            <button className={styles.btn}>
              <FontAwesomeIcon icon={faCog} /> Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        
        {/* Column 1: Platform Settings */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Platform Settings</h3>
          
          <div className={styles.settingsGroup}>
            <span className={styles.sectionLabel}>Account</span>
            <SwitchItem 
              label="Email me when someone follows me" 
              checked={settings.emailFollows} 
              onChange={() => toggleSetting('emailFollows')} 
            />
            <SwitchItem 
              label="Email me when someone answers on my post" 
              checked={settings.emailAnswers} 
              onChange={() => toggleSetting('emailAnswers')} 
            />
            <SwitchItem 
              label="Email me when someone mentions me" 
              checked={settings.emailMentions} 
              onChange={() => toggleSetting('emailMentions')} 
            />
          </div>

          <div className={styles.settingsGroup}>
            <span className={styles.sectionLabel}>Application</span>
            <SwitchItem 
              label="New launches and projects" 
              checked={settings.newLaunches} 
              onChange={() => toggleSetting('newLaunches')} 
            />
            <SwitchItem 
              label="Monthly product updates" 
              checked={settings.monthlyUpdates} 
              onChange={() => toggleSetting('monthlyUpdates')} 
            />
            <SwitchItem 
              label="Subscribe to newsletter" 
              checked={settings.subscribeNewsletter} 
              onChange={() => toggleSetting('subscribeNewsletter')} 
            />
          </div>
        </div>

        {/* Column 2: Profile Information */}
        <div className={styles.card}>
          <div className={styles.headerRow}>
            <h3 className={classNames(styles.cardTitle, 'mb-0')} style={{marginBottom: 0}}>
                Profile Information
            </h3>
            <FontAwesomeIcon icon={faPen} className={styles.editIcon} />
          </div>
          
          <p className={styles.profileDesc}>
            Hi, I'm Alec Thompson, Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (pain avoidance is creating an illusion of equality).
          </p>

          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Full Name:</span>
              <span className={styles.infoValue}>Alec M. Thompson</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Mobile:</span>
              <span className={styles.infoValue}>(44) 123 1234 123</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>alecthompson@mail.com</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Location:</span>
              <span className={styles.infoValue}>USA</span>
            </div>
            <div className={classNames(styles.infoRow, 'items-center')} style={{alignItems: 'center'}}>
              <span className={styles.infoLabel}>Social:</span>
              <div className={styles.socialIcons}>
                <FontAwesomeIcon icon={faFacebookF} className={styles.socialIcon} />
                <FontAwesomeIcon icon={faTwitter} className={styles.socialIcon} />
                <FontAwesomeIcon icon={faInstagram} className={styles.socialIcon} />
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Conversations */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Conversations</h3>
          <div className={styles.conversationsList}>
            {conversations.map((item) => (
              <div key={item.id} className={styles.conversationItem}>
                <div className={styles.convoLeft}>
                  <img src={item.avatar} alt={item.name} className={styles.convoAvatar} />
                  <div className={styles.convoInfo}>
                    <h4>{item.name}</h4>
                    <p>{item.msg}</p>
                  </div>
                </div>
                <button className={styles.replyBtn}>Reply</button>
              </div>
            ))}
          </div>
        </div>

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