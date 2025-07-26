import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, friendsAPI, storeAPI } from '../../services/api';
import { Analytics as AnalyticsData, StoreItem } from '../../types';
import Icon from '@mdi/react';
import { 
  mdiChevronDown, 
  mdiChevronUp, 
  mdiChartLine, 
  mdiAccountGroup, 
  mdiCog,
  mdiAccountPlus,
  mdiTshirtCrew
} from '@mdi/js';
import { GlassCard } from '../Common/GlassCard';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`;

const LargeAvatar = styled.div<{ level?: number; avatarFrame?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  color: white;
  font-size: 3.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  ${props => {
    // Check for equipped avatar frame first
    if (props.avatarFrame) {
      switch (props.avatarFrame) {
        case 'Golden Border':
          return `background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);`;
        case 'Silver Frame':
          return `background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);`;
        case 'Bronze Ring':
          return `background: linear-gradient(135deg, #CD7F32 0%, #B8860B 100%);`;
        case 'Neon Outline':
          return `background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);`;
        case 'Fire Ring':
          return `background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);`;
        case 'Ice Crown':
          return `background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);`;
        case 'Rainbow Arc':
          return `background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #feca57 100%);`;
        case 'Dragon Scale':
          return `background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);`;
        case 'Space Halo':
          return `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;
        case 'Diamond Crust':
          return `background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);`;
      }
    }
    
    // Fallback to level-based styling
    const level = props.level || 1;
    if (level >= 20) {
      return `background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);`; // Gold
    } else if (level >= 10) {
      return `background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);`; // Silver
    } else if (level >= 5) {
      return `background: linear-gradient(135deg, #CD7F32 0%, #B8860B 100%);`; // Bronze
    } else {
      return `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`; // Default
    }
  }}
`;

const UserName = styled.h1`
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const UserLevel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  font-weight: 500;
  margin-top: 8px;
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 16px;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
`;

const SectionHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 20px;
  cursor: pointer;
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: color 0.3s ease;

  &:hover {
    color: rgba(255, 255, 255, 1);
  }
`;

const SectionContent = styled.div<{ expanded: boolean }>`
  max-height: ${props => props.expanded ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const AnalyticsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const AnalyticsNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const AnalyticsLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InsightItem = styled.div`
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  line-height: 1.4;
`;

const FriendsSection = styled.div`
  margin-top: 20px;
`;

const AddFriendForm = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const FriendInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const AddFriendButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.8);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(102, 126, 234, 0.9);
    transform: translateY(-1px);
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SettingLabel = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
`;

const SettingToggle = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.8);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.9);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
`;

const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
`;

const EquipmentSlot = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SlotLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const SlotContent = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 0.9rem;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlotEmpty = styled.div`
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
  font-size: 0.8rem;
`;

const OwnedItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 20px;
`;

const OwnedItem = styled.div<{ equipped?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.equipped 
    ? 'rgba(76, 175, 80, 0.5)' 
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.equipped && `
    background: rgba(76, 175, 80, 0.1);
    box-shadow: 0 0 12px rgba(76, 175, 80, 0.2);
  `}
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
  }
`;

const ItemIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const ItemName = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.2;
`;

const EquippedBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: white;
  font-weight: bold;
`;

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const [friendsExpanded, setFriendsExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [equipmentExpanded, setEquipmentExpanded] = useState(true);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [ownedItems, setOwnedItems] = useState<StoreItem[]>([]);

  useEffect(() => {
    loadAnalytics();
    loadOwnedItems();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.getUserAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadOwnedItems = async () => {
    try {
      const items = await storeAPI.getPurchases();
      setOwnedItems(items);
    } catch (error) {
      console.error('Failed to load owned items:', error);
    }
  };

  const handleEquipItem = async (item: StoreItem) => {
    if (user) {
      const updatedUser = { ...user };
      switch (item.type) {
        case 'theme':
          updatedUser.equipped_theme = item.name;
          break;
        case 'badge':
          updatedUser.equipped_badge = item.name;
          break;
        case 'avatar_frame':
          updatedUser.equipped_avatar_frame = item.name;
          break;
      }
      updateUser(updatedUser);
    }
  };

  const isItemEquipped = (item: StoreItem) => {
    switch (item.type) {
      case 'theme':
        return user?.equipped_theme === item.name;
      case 'badge':
        return user?.equipped_badge === item.name;
      case 'avatar_frame':
        return user?.equipped_avatar_frame === item.name;
      default:
        return false;
    }
  };

  const getItemIcon = (item: StoreItem) => {
    switch (item.type) {
      case 'theme':
        return '🎨';
      case 'badge':
        return item.name.split(' ')[0] || '🏆';
      case 'avatar_frame':
        return '🖼️';
      default:
        return '🎨';
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
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  const getBadges = () => {
    try {
      return user?.badges ? JSON.parse(user.badges) : [];
    } catch {
      return [];
    }
  };

  const generateInsights = (data: AnalyticsData) => {
    const insights = [];
    
    if (data.patterns.bestDay) {
      insights.push(`Your most active day is ${data.patterns.bestDay}`);
    }
    
    if (data.consistencyScore > 80) {
      insights.push('You\'re a consistency champion! Keep it up! 🏆');
    } else if (data.consistencyScore > 60) {
      insights.push('Good consistency! Try to maintain your routine 👍');
    } else {
      insights.push('Focus on building a more consistent routine 📈');
    }
    
    if (data.basicStats.current_streak >= 7) {
      insights.push(`Amazing ${data.basicStats.current_streak}-day streak! 🔥`);
    } else if (data.basicStats.current_streak >= 3) {
      insights.push(`Nice ${data.basicStats.current_streak}-day streak! Keep going! ⚡`);
    }

    if (data.patterns.bestHour !== undefined) {
      const hour = data.patterns.bestHour;
      const timeStr = hour < 12 ? `${hour}AM` : `${hour - 12}PM`;
      insights.push(`You're most active around ${timeStr}`);
    }

    return insights.slice(0, 4);
  };

  const handleAddFriend = async () => {
    if (!newFriendUsername.trim()) return;
    
    try {
      await friendsAPI.addFriend(newFriendUsername);
      setNewFriendUsername('');
      // In a real app, you'd refresh the friends list here
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  return (
    <ProfileContainer>
      {/* Profile Header */}
      <GlassCard>
        <AvatarSection>
          <LargeAvatar level={user?.level} avatarFrame={user?.equipped_avatar_frame}>
            {getProfileAvatar()}
          </LargeAvatar>
          <div>
            <UserName>{user?.username || 'User'}</UserName>
            <UserLevel>Level {user?.level || 1} • {user?.experience || 0} XP</UserLevel>
          </div>
        </AvatarSection>

        <UserStats>
          <GlassCard padding="0">
            <StatItem>
              <StatNumber>{user?.total_sessions || 0}</StatNumber>
              <StatLabel>Sessions</StatLabel>
            </StatItem>
          </GlassCard>
          <GlassCard padding="0">
            <StatItem>
              <StatNumber>{user?.current_streak || 0}</StatNumber>
              <StatLabel>Streak</StatLabel>
            </StatItem>
          </GlassCard>
          <GlassCard padding="0">
            <StatItem>
              <StatNumber>{getBadges().length}</StatNumber>
              <StatLabel>Badges</StatLabel>
            </StatItem>
          </GlassCard>
        </UserStats>
      </GlassCard>

      {/* Equipment Section */}
      <GlassCard>
        <SectionHeader onClick={() => setEquipmentExpanded(!equipmentExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icon path={mdiTshirtCrew} size={1.2} />
            Equipment & Items
          </div>
          <Icon path={equipmentExpanded ? mdiChevronUp : mdiChevronDown} size={1} />
        </SectionHeader>
        
        <SectionContent expanded={equipmentExpanded}>
          <EquipmentGrid>
            <EquipmentSlot>
              <SlotLabel>🎮 Theme Slot</SlotLabel>
              <SlotContent>
                {user?.equipped_theme || <SlotEmpty>No theme equipped</SlotEmpty>}
              </SlotContent>
            </EquipmentSlot>
            <EquipmentSlot>
              <SlotLabel>🏆 Badge Slot</SlotLabel>
              <SlotContent>
                {user?.equipped_badge || <SlotEmpty>No badge equipped</SlotEmpty>}
              </SlotContent>
            </EquipmentSlot>
            <EquipmentSlot>
              <SlotLabel>🖼️ Avatar Frame</SlotLabel>
              <SlotContent>
                {user?.equipped_avatar_frame || <SlotEmpty>No frame equipped</SlotEmpty>}
              </SlotContent>
            </EquipmentSlot>
          </EquipmentGrid>

          {ownedItems.length > 0 ? (
            <OwnedItemsGrid>
              {ownedItems.map((item) => (
                <OwnedItem
                  key={item.id}
                  equipped={isItemEquipped(item)}
                  onClick={() => handleEquipItem(item)}
                >
                  {isItemEquipped(item) && <EquippedBadge>✓</EquippedBadge>}
                  <ItemIcon>{getItemIcon(item)}</ItemIcon>
                  <ItemName>{item.name}</ItemName>
                </OwnedItem>
              ))}
            </OwnedItemsGrid>
          ) : (
            <EmptyState>
              No items owned yet!<br />
              Visit the store to get some customization items.
            </EmptyState>
          )}
        </SectionContent>
      </GlassCard>

      {/* Analytics Section */}
      <GlassCard>
        <SectionHeader onClick={() => setAnalyticsExpanded(!analyticsExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icon path={mdiChartLine} size={1.2} />
            Analytics & Insights
          </div>
          <Icon path={analyticsExpanded ? mdiChevronUp : mdiChevronDown} size={1} />
        </SectionHeader>
        
        <SectionContent expanded={analyticsExpanded}>
          {analytics ? (
            <>
              <AnalyticsGrid>
                <AnalyticsCard>
                  <AnalyticsNumber>{analytics.consistencyScore}%</AnalyticsNumber>
                  <AnalyticsLabel>Consistency</AnalyticsLabel>
                </AnalyticsCard>
                <AnalyticsCard>
                  <AnalyticsNumber>{analytics.basicStats.longest_streak}</AnalyticsNumber>
                  <AnalyticsLabel>Best Streak</AnalyticsLabel>
                </AnalyticsCard>
              </AnalyticsGrid>
              
              <InsightsList>
                {generateInsights(analytics).map((insight, index) => (
                  <InsightItem key={index}>{insight}</InsightItem>
                ))}
              </InsightsList>
            </>
          ) : (
            <EmptyState>Loading analytics...</EmptyState>
          )}
        </SectionContent>
      </GlassCard>

      {/* Friends Section */}
      <GlassCard>
        <SectionHeader onClick={() => setFriendsExpanded(!friendsExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icon path={mdiAccountGroup} size={1.2} />
            Friends & Social
          </div>
          <Icon path={friendsExpanded ? mdiChevronUp : mdiChevronDown} size={1} />
        </SectionHeader>
        
        <SectionContent expanded={friendsExpanded}>
          <FriendsSection>
            <AddFriendForm>
              <FriendInput
                type="text"
                placeholder="Enter username..."
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
              />
              <AddFriendButton onClick={handleAddFriend}>
                <Icon path={mdiAccountPlus} size={0.9} />
                Add Friend
              </AddFriendButton>
            </AddFriendForm>
            
            <EmptyState>
              Friends feature coming soon! 🚀<br />
              Connect with other crankers to compete and motivate each other.
            </EmptyState>
          </FriendsSection>
        </SectionContent>
      </GlassCard>

      {/* Settings Section */}
      <GlassCard>
        <SectionHeader onClick={() => setSettingsExpanded(!settingsExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icon path={mdiCog} size={1.2} />
            Settings & Preferences
          </div>
          <Icon path={settingsExpanded ? mdiChevronUp : mdiChevronDown} size={1} />
        </SectionHeader>
        
        <SectionContent expanded={settingsExpanded}>
          <SettingsGrid>
            <SettingItem>
              <SettingLabel>Notifications</SettingLabel>
              <SettingToggle>Enabled</SettingToggle>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Privacy Mode</SettingLabel>
              <SettingToggle>Disabled</SettingToggle>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Dark Theme</SettingLabel>
              <SettingToggle>Auto</SettingToggle>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Sound Effects</SettingLabel>
              <SettingToggle>Enabled</SettingToggle>
            </SettingItem>
          </SettingsGrid>
        </SectionContent>
      </GlassCard>
    </ProfileContainer>
  );
}; 