import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const UserInfo = styled.div`
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; // Space for bottom nav
  overflow-y: auto;
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
  transition: all 0.3s;
  color: ${props => props.active ? '#667eea' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
`;

const NavIcon = styled.div`
  font-size: 1.5rem;
`;

const NavLabel = styled.span`
  font-size: 12px;
`;

interface LayoutProps {
  children: React.ReactNode;
  currentTab: 'home' | 'community' | 'store';
  onTabChange: (tab: 'home' | 'community' | 'store') => void;
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

  return (
    <LayoutContainer>
      <Header>
        <Logo>🍆 FapTracker</Logo>
        <UserInfo>
          <span>
            {getBadges().map((badge: string, index: number) => (
              <span key={index}>{badge}</span>
            ))}
            {user?.username}
          </span>
          <LogoutButton onClick={logout}>Logout</LogoutButton>
        </UserInfo>
      </Header>

      <MainContent>
        {children}
      </MainContent>

      <BottomNav>
        <NavItem 
          active={currentTab === 'home'} 
          onClick={() => onTabChange('home')}
        >
          <NavIcon>🏠</NavIcon>
          <NavLabel>Home</NavLabel>
        </NavItem>
        <NavItem 
          active={currentTab === 'community'} 
          onClick={() => onTabChange('community')}
        >
          <NavIcon>👥</NavIcon>
          <NavLabel>Community</NavLabel>
        </NavItem>
        <NavItem 
          active={currentTab === 'store'} 
          onClick={() => onTabChange('store')}
        >
          <NavIcon>🛒</NavIcon>
          <NavLabel>Store</NavLabel>
        </NavItem>
      </BottomNav>
    </LayoutContainer>
  );
};