import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

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

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  scroll-behavior: smooth;

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
  font-size: 1.5rem;
  line-height: 1;

  @media (max-width: 480px) {
    font-size: 1.3rem;
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

interface LayoutProps {
  children: React.ReactNode;
  currentTab: 'home' | 'analytics' | 'community' | 'store';
  onTabChange: (tab: 'home' | 'analytics' | 'community' | 'store') => void;
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

  const handleTabChange = (tab: 'home' | 'analytics' | 'community' | 'store') => {
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
      case 'home': return 'Home';
      case 'analytics': return 'Analytics';
      case 'community': return 'Community';
      case 'store': return 'Store';
      default: return tab;
    }
  };

  return (
    <LayoutContainer>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      
      <Header role="banner">
        <Logo>🍆 FapTracker</Logo>
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
          <LogoutButton 
            onClick={logout}
            aria-label="Logout from your account"
            type="button"
          >
            Logout
          </LogoutButton>
        </UserInfo>
      </Header>

      <MainContent id="main-content" role="main" tabIndex={-1}>
        {children}
      </MainContent>

      <BottomNav role="navigation" aria-label="Main navigation">
        <NavItem 
          active={currentTab === 'home'} 
          onClick={() => handleTabChange('home')}
          aria-label={`${getTabLabel('home')} ${currentTab === 'home' ? '(current page)' : ''}`}
          aria-current={currentTab === 'home' ? 'page' : undefined}
          type="button"
        >
          <NavIcon role="img" aria-hidden="true">🏠</NavIcon>
          <NavLabel>Home</NavLabel>
          <ScreenReaderOnly>
            {currentTab === 'home' && '(current)'}
          </ScreenReaderOnly>
        </NavItem>
        <NavItem 
          active={currentTab === 'analytics'} 
          onClick={() => handleTabChange('analytics')}
          aria-label={`${getTabLabel('analytics')} ${currentTab === 'analytics' ? '(current page)' : ''}`}
          aria-current={currentTab === 'analytics' ? 'page' : undefined}
          type="button"
        >
          <NavIcon role="img" aria-hidden="true">📊</NavIcon>
          <NavLabel>Analytics</NavLabel>
          <ScreenReaderOnly>
            {currentTab === 'analytics' && '(current)'}
          </ScreenReaderOnly>
        </NavItem>
        <NavItem 
          active={currentTab === 'community'} 
          onClick={() => handleTabChange('community')}
          aria-label={`${getTabLabel('community')} ${currentTab === 'community' ? '(current page)' : ''}`}
          aria-current={currentTab === 'community' ? 'page' : undefined}
          type="button"
        >
          <NavIcon role="img" aria-hidden="true">👥</NavIcon>
          <NavLabel>Community</NavLabel>
          <ScreenReaderOnly>
            {currentTab === 'community' && '(current)'}
          </ScreenReaderOnly>
        </NavItem>
        <NavItem 
          active={currentTab === 'store'} 
          onClick={() => handleTabChange('store')}
          aria-label={`${getTabLabel('store')} ${currentTab === 'store' ? '(current page)' : ''}`}
          aria-current={currentTab === 'store' ? 'page' : undefined}
          type="button"
        >
          <NavIcon role="img" aria-hidden="true">🛒</NavIcon>
          <NavLabel>Store</NavLabel>
          <ScreenReaderOnly>
            {currentTab === 'store' && '(current)'}
          </ScreenReaderOnly>
        </NavItem>
      </BottomNav>
    </LayoutContainer>
  );
};