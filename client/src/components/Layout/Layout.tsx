import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Icon from '@mdi/react';
import { mdiAccountGroup, mdiHome, mdiStore, mdiAccount } from '@mdi/js';

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: #667eea;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 10000;
  font-weight: 600;

  &:focus {
    top: 6px;
  }
`;

// Map active skin to a global page background gradient
const getSkinGradient = (skin?: string) => {
  switch (skin) {
    case 'Fire Theme': return 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)';
    case 'Ocean Theme': return 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
    case 'Dark Mode Pro': return 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
    case 'Neon Glow': return 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)';
    case 'Forest Theme': return 'linear-gradient(135deg, #228b22 0%, #32cd32 100%)';
    case 'Sunset Glow': return 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)';
    case 'Ice Crystal': return 'linear-gradient(135deg, #00bfff 0%, #87ceeb 100%)';
    case 'Cosmic Purple': return 'linear-gradient(135deg, #4b0082 0%, #8a2be2 100%)';
    case 'Cherry Blossom': return 'linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%)';
    case 'Midnight Black': return 'linear-gradient(135deg, #000000 0%, #2c2c2c 100%)';
    case 'Retro Wave': return 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)';
    case 'Minimalist White': return 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
    case 'Gaming RGB': return 'linear-gradient(135deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)';
    case 'Coffee Shop': return 'linear-gradient(135deg, #8b4513 0%, #d2691e 100%)';
    case 'Beach Sunset': return 'linear-gradient(135deg, #ff8a80 0%, #ffcc02 100%)';
    case 'Lava Flow': return 'linear-gradient(135deg, #ff4500 0%, #8b0000 100%)';
    case 'Electric Blue': return 'linear-gradient(135deg, #0080ff 0%, #0040ff 100%)';
    case 'Golden Hour': return 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)';
    case 'Matrix Green': return 'linear-gradient(135deg, #00ff00 0%, #008000 100%)';
    case 'Rose Gold': return 'linear-gradient(135deg, #e8b4b8 0%, #d4af37 100%)';
    default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
};

const LayoutContainer = styled.div<{ skin?: string }>`
  min-height: 100vh;
  background: ${props => getSkinGradient(props.skin)};
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 480px) {
    padding: 12px 15px;
  }
`;

const Logo = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const UserInfo = styled.div`
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  @media (max-width: 480px) {
    display: none;
  }
`;

const UserDetailsMobile = styled.div`
  display: none;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  @media (max-width: 480px) {
    display: flex;
  }
`;

const Username = styled.div`
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const LevelInfo = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;

  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 44px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; // Space for bottom nav
  overflow-y: auto;
  overflow-x: hidden; // Prevent horizontal scrollbars
  scroll-behavior: smooth;
  scrollbar-gutter: stable; // Reserve space for scrollbar to prevent layout shift

  @media (max-width: 480px) {
    padding: 15px;
    padding-bottom: 90px;
  }
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 15px 0;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  /* Safe area support for devices with notches */
  padding-bottom: max(15px, env(safe-area-inset-bottom));

  @media (max-width: 480px) {
    padding: 12px 0;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
`;

const NavItem = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s ease;
  color: ${props => props.active ? '#667eea' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  min-height: 44px;
  min-width: 44px;
  flex: 1;
  max-width: 80px;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    padding: 8px;
    gap: 3px;
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const NavLabel = styled.span`
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const ScreenReaderOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ProfileAvatar = styled.button<{ avatarStyle?: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: ${props => props.avatarStyle || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
`;

const BadgeOverlay = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #4CAF50;
  border-radius: 50%;
  border: 2px solid white;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    width: 14px;
    height: 14px;
    font-size: 0.6rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
  currentTab: 'community' | 'home' | 'store' | 'profile';
  onTabChange: (tab: 'community' | 'home' | 'store' | 'profile') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const getBadges = () => {
    try {
      return user?.badges ? JSON.parse(user.badges) : [];
    } catch {
      return [];
    }
  };

  const getProfileAvatar = () => {
    // Show equipped badge or first letter of username
    if (user?.equipped_badge) {
      // Extract emoji from badge name (first character if it's an emoji)
      const badgeEmoji = user.equipped_badge.charAt(0);
      // Check if it's an emoji by checking Unicode ranges
      const emojiRegex = /[\u1F600-\u1F64F]|[\u1F300-\u1F5FF]|[\u1F680-\u1F6FF]|[\u1F1E0-\u1F1FF]|[\u2600-\u26FF]|[\u2700-\u27BF]/;
      if (badgeEmoji.length > 0 && emojiRegex.test(badgeEmoji)) {
        return badgeEmoji;
      }
    }
    
    // Fallback to first letter of username
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return <Icon path={mdiAccount} size={0.8} />;
  };

  const getAvatarStyle = () => {
    // Check for equipped avatar frame first
    if (user?.equipped_avatar_frame) {
      switch (user.equipped_avatar_frame) {
        case 'Golden Border':
          return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
        case 'Silver Frame':
          return 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)';
        case 'Bronze Ring':
          return 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)';
        case 'Neon Outline':
          return 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)';
        case 'Fire Ring':
          return 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)';
        case 'Ice Crown':
          return 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
        case 'Rainbow Arc':
          return 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #feca57 100%)';
        case 'Dragon Scale':
          return 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)';
        case 'Space Halo':
          return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        case 'Diamond Crust':
          return 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
      }
    }
    
    // Fallback to level-based styling
    const level = user?.level || 1;
    if (level >= 20) {
      return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'; // Gold
    } else if (level >= 10) {
      return 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)'; // Silver
    } else if (level >= 5) {
      return 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'; // Bronze
    }
    
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Default
  };

  const handleTabChange = (tab: 'community' | 'home' | 'store' | 'profile') => {
    onTabChange(tab);
    
    // Announce tab change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Switched to ${tab} tab`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'community': return 'Community';
      case 'home': return 'Home';
      case 'store': return 'Store';
      case 'profile': return 'Profile';
      default: return tab;
    }
  };

  return (
    <LayoutContainer skin={user?.equipped_theme}>      
      <Header role="banner">
        <Logo>Crankerz</Logo>
        <UserInfo>
          <UserDetails>
            <Username>
              {getBadges().map((badge: string, index: number) => (
                <span key={index} role="img" aria-label="badge">{badge}</span>
              ))}
              {user?.username}
            </Username>
            <LevelInfo>Level {user?.level || 1} • {user?.experience || 0} XP</LevelInfo>
          </UserDetails>
          <UserDetailsMobile>
            <Username>
              {user?.username}
            </Username>
            <LevelInfo>Lv.{user?.level || 1}</LevelInfo>
          </UserDetailsMobile>
          <HeaderActions>
            <ProfileAvatar 
              onClick={() => handleTabChange('profile')}
              aria-label="Open profile and settings"
              type="button"
              avatarStyle={getAvatarStyle()}
            >
              {getProfileAvatar()}
              {getBadges().length > 0 && (
                <BadgeOverlay aria-label={`${getBadges().length} badges`}>
                  {getBadges().length}
                </BadgeOverlay>
              )}
            </ProfileAvatar>
            <LogoutButton 
              onClick={logout}
              aria-label="Logout from your account"
              type="button"
            >
              Logout
            </LogoutButton>
          </HeaderActions>
        </UserInfo>
      </Header>

      <MainContent id="main-content" role="main" tabIndex={-1}>
        {children}
      </MainContent>

      <BottomNav role="navigation" aria-label="Main navigation">
        <NavItem 
          active={currentTab === 'community'} 
          onClick={() => handleTabChange('community')}
          aria-label={`${getTabLabel('community')} ${currentTab === 'community' ? '(current page)' : ''}`}
          aria-current={currentTab === 'community' ? 'page' : undefined}
          type="button"
        >
          <NavIcon role="img" aria-hidden="true">
            <Icon path={mdiAccountGroup} size={1} color={currentTab === 'community' ? '#667eea' : '#666'} />
          </NavIcon>
          <NavLabel>Community</NavLabel>
          <ScreenReaderOnly>
            {currentTab === 'community' && '(current)'}
          </ScreenReaderOnly>
        </NavItem>
        <NavItem 
          active={currentTab === 'home'} 
          onClick={() => handleTabChange('home')}
          aria-label={`${getTabLabel('home')} ${currentTab === 'home' ? '(current page)' : ''}`}
          aria-current={currentTab === 'home' ? 'page' : undefined}
          type="button"
        >
          <NavIcon role="img" aria-hidden="true">
            <Icon path={mdiHome} size={1} color={currentTab === 'home' ? '#667eea' : '#666'} />
          </NavIcon>
          <NavLabel>Home</NavLabel>
          <ScreenReaderOnly>
            {currentTab === 'home' && '(current)'}
          </ScreenReaderOnly>
        </NavItem>
        <NavItem 
          active={currentTab === 'store'} 
          onClick={() => handleTabChange('store')}
          aria-label={`${getTabLabel('store')} ${currentTab === 'store' ? '(current page)' : ''}`}
          aria-current={currentTab === 'store' ? 'page' : undefined}
          type="button"
        >
          <NavIcon role="img" aria-hidden="true">
            <Icon path={mdiStore} size={1} color={currentTab === 'store' ? '#667eea' : '#666'} />
          </NavIcon>
          <NavLabel>Store</NavLabel>
          <ScreenReaderOnly>
            {currentTab === 'store' && '(current)'}
          </ScreenReaderOnly>
        </NavItem>
      </BottomNav>
    </LayoutContainer>
  );
};