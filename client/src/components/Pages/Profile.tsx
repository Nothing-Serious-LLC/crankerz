import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, friendsAPI } from '../../services/api';
import { Analytics as AnalyticsData } from '../../types';
import Icon from '@mdi/react';
import { 
  mdiChevronDown, 
  mdiChevronUp, 
  mdiChartLine, 
  mdiAccountGroup, 
  mdiCog,
  mdiAccountPlus,
  mdiAccount,
  mdiTrophy,
  mdiCalendar,
  mdiTrendingUp
} from '@mdi/js';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`;

const ProfileHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const LargeAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const UserName = styled.h1`
  color: #333;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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
  color: #333;

  &:hover {
    color: #667eea;
  }
`;

const SectionContent = styled.div<{ expanded: boolean }>`
  max-height: ${props => props.expanded ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
`;

const AnalyticsCard = styled.div`
  background: rgba(102, 126, 234, 0.1);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
`;

const AnalyticsNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
`;

const AnalyticsLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InsightItem = styled.div`
  padding: 15px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 10px;
  font-size: 0.95rem;
  color: #555;
  border-left: 4px solid #667eea;
`;

const FriendsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AddFriendForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const FriendInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 10px;
`;

const SettingLabel = styled.div`
  font-weight: 600;
  color: #333;
`;

const SettingValue = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [analyticsExpanded, setAnalyticsExpanded] = useState(true);
  const [friendsExpanded, setFriendsExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [newFriend, setNewFriend] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.getUserAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const getProfileAvatar = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return '?';
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
      insights.push(`🎯 Most active day: ${data.patterns.bestDay}`);
    }
    
    if (data.patterns.bestHour !== undefined) {
      const hour = data.patterns.bestHour;
      const timeStr = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      insights.push(`⏰ Peak performance time: ${timeStr}`);
    }
    
    if (data.consistencyScore > 80) {
      insights.push('🏆 Consistency champion! Keep up the excellent work!');
    } else if (data.consistencyScore > 60) {
      insights.push('👍 Good consistency! You\'re building great habits!');
    } else {
      insights.push('📈 Focus on building more consistent habits for better results');
    }
    
    if (data.basicStats.current_streak >= 7) {
      insights.push(`🔥 Amazing ${data.basicStats.current_streak}-day streak! You\'re on fire!`);
    } else if (data.basicStats.current_streak >= 3) {
      insights.push(`✨ Nice ${data.basicStats.current_streak}-day streak building up!`);
    }

    return insights;
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriend.trim()) return;

    setIsAddingFriend(true);
    try {
      await friendsAPI.addFriend(newFriend.trim());
      setNewFriend('');
      // Refresh friends list here when implemented
    } catch (error) {
      console.error('Failed to add friend:', error);
    } finally {
      setIsAddingFriend(false);
    }
  };

  return (
    <ProfileContainer>
      {/* Profile Header */}
      <ProfileHeader>
        <AvatarSection>
          <LargeAvatar>
            {getProfileAvatar()}
          </LargeAvatar>
          <UserName>{user?.username}</UserName>
          <div style={{ display: 'flex', gap: '5px', fontSize: '1.2rem' }}>
            {getBadges().map((badge: string, index: number) => (
              <span key={index} role="img" aria-label="badge">{badge}</span>
            ))}
          </div>
        </AvatarSection>
        
        <UserStats>
          <StatItem>
            <StatNumber>Level {user?.level || 1}</StatNumber>
            <StatLabel>Current Level</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{user?.experience || 0}</StatNumber>
            <StatLabel>Total XP</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{user?.total_sessions || 0}</StatNumber>
            <StatLabel>Sessions</StatLabel>
          </StatItem>
        </UserStats>
      </ProfileHeader>

      {/* Analytics Section */}
      <Section>
        <SectionHeader onClick={() => setAnalyticsExpanded(!analyticsExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon path={mdiChartLine} size={1} color="#667eea" />
            <span>Analytics & Insights</span>
          </div>
          <Icon 
            path={analyticsExpanded ? mdiChevronUp : mdiChevronDown} 
            size={1} 
            color="#667eea" 
          />
        </SectionHeader>
        
        <SectionContent expanded={analyticsExpanded}>
          {analytics ? (
            <>
              <AnalyticsGrid>
                <AnalyticsCard>
                  <AnalyticsNumber>{analytics.consistencyScore}%</AnalyticsNumber>
                  <AnalyticsLabel>Consistency Score</AnalyticsLabel>
                </AnalyticsCard>
                <AnalyticsCard>
                  <AnalyticsNumber>{analytics.basicStats.longest_streak}</AnalyticsNumber>
                  <AnalyticsLabel>Best Streak</AnalyticsLabel>
                </AnalyticsCard>
                <AnalyticsCard>
                  <AnalyticsNumber>{analytics.basicStats.current_streak}</AnalyticsNumber>
                  <AnalyticsLabel>Current Streak</AnalyticsLabel>
                </AnalyticsCard>
              </AnalyticsGrid>
              
              <InsightsList>
                {generateInsights(analytics).map((insight, index) => (
                  <InsightItem key={index}>{insight}</InsightItem>
                ))}
              </InsightsList>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              Loading analytics...
            </div>
          )}
        </SectionContent>
      </Section>

      {/* Friends Section */}
      <Section>
        <SectionHeader onClick={() => setFriendsExpanded(!friendsExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon path={mdiAccountGroup} size={1} color="#667eea" />
            <span>Friends & Social</span>
          </div>
          <Icon 
            path={friendsExpanded ? mdiChevronUp : mdiChevronDown} 
            size={1} 
            color="#667eea" 
          />
        </SectionHeader>
        
        <SectionContent expanded={friendsExpanded}>
          <FriendsSection>
            <AddFriendForm onSubmit={handleAddFriend}>
              <FriendInput
                type="text"
                placeholder="Enter username to add friend"
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
              />
              <AddButton type="submit" disabled={isAddingFriend || !newFriend.trim()}>
                <Icon path={mdiAccountPlus} size={0.8} />
              </AddButton>
            </AddFriendForm>
            
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              Friends list coming soon! 🚀
            </div>
          </FriendsSection>
        </SectionContent>
      </Section>

      {/* Settings Section */}
      <Section>
        <SectionHeader onClick={() => setSettingsExpanded(!settingsExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon path={mdiCog} size={1} color="#667eea" />
            <span>Settings & Preferences</span>
          </div>
          <Icon 
            path={settingsExpanded ? mdiChevronUp : mdiChevronDown} 
            size={1} 
            color="#667eea" 
          />
        </SectionHeader>
        
        <SectionContent expanded={settingsExpanded}>
          <SettingsGrid>
            <SettingItem>
              <SettingLabel>Country</SettingLabel>
              <SettingValue>{user?.country || 'Not set'}</SettingValue>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Active Theme</SettingLabel>
              <SettingValue>{user?.active_skin || 'Default'}</SettingValue>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Account Created</SettingLabel>
              <SettingValue>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </SettingValue>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Privacy Settings</SettingLabel>
              <SettingValue>Coming soon</SettingValue>
            </SettingItem>
          </SettingsGrid>
        </SectionContent>
      </Section>
    </ProfileContainer>
  );
}; 