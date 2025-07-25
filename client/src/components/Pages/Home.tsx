import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI, userAPI, achievementAPI, analyticsAPI } from '../../services/api';
import { Achievement, Analytics as AnalyticsData } from '../../types';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp, mdiChartLine } from '@mdi/js';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px;
`;

const LevelSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const LevelBadge = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 25px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: 15px;
  display: inline-block;
`;

const ExperienceInfo = styled.div`
  color: #666;
  font-size: 1rem;
  margin-bottom: 15px;
`;

const ExperienceBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e1e5e9;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ExperienceProgress = styled.div<{ percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: ${props => props.percentage}%;
  transition: width 0.5s ease;
  border-radius: 6px;
`;

const CheckInSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const CheckInButton = styled.button<{ skin?: string }>`
  width: 120px;
  height: 200px;
  border-radius: 60px 60px 50px 50px;
  border: none;
  font-size: 3rem;
  cursor: pointer;
  transition: all 0.3s;
  margin: 20px 0;
  position: relative;
  
  ${props => {
    switch (props.skin) {
      case 'fire':
        return `
          background: linear-gradient(45deg, #ff6b6b, #ffa500);
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
        `;
      case 'ocean':
        return `
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          box-shadow: 0 10px 30px rgba(78, 205, 196, 0.4);
        `;
      case 'dark':
        return `
          background: linear-gradient(45deg, #2c3e50, #34495e);
          box-shadow: 0 10px 30px rgba(44, 62, 80, 0.4);
        `;
      case 'neon':
        return `
          background: linear-gradient(45deg, #ff00ff, #00ffff);
          box-shadow: 0 10px 30px rgba(255, 0, 255, 0.4);
        `;
      default:
        return `
          background: linear-gradient(45deg, #667eea, #764ba2);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        `;
    }
  }}

  &:hover {
    transform: translateY(-5px) scale(1.05);
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 30px;
    background: inherit;
    border-radius: 20px 20px 15px 15px;
  }
`;

const CheckInText = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 10px;
`;

const CheckInLabel = styled.div`
  font-weight: 600;
  color: #333;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  font-weight: 600;
`;

const LastSessionText = styled.p`
  color: #888;
  font-size: 0.9rem;
  margin-top: 15px;
`;

const StatsGrid = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
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

const RecentAchievements = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const AchievementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AchievementEmoji = styled.div`
  font-size: 2rem;
`;

const AchievementInfo = styled.div`
  flex: 1;
`;

const AchievementName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const AchievementDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const AchievementReward = styled.div`
  background: #667eea;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const AnalyticsSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const AnalyticsHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 20px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;

  &:hover {
    color: #667eea;
  }
`;

const AnalyticsContent = styled.div<{ expanded: boolean }>`
  max-height: ${props => props.expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const AnalyticsItem = styled.div`
  text-align: center;
  padding: 15px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
`;

const AnalyticsNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
`;

const AnalyticsLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InsightItem = styled.div`
  padding: 10px 15px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #555;
`;

export const Home: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Check if user has already checked in today
    if (user?.last_session) {
      const lastSession = new Date(user.last_session);
      const today = new Date();
      const isToday = lastSession.toDateString() === today.toDateString();
      
      if (isToday) {
        setCanCheckIn(false);
      }
    }

    // Load recent achievements and analytics
    loadRecentAchievements();
    loadAnalytics();
  }, [user]);

  const loadRecentAchievements = async () => {
    try {
      const achievements = await achievementAPI.getAchievements();
      // Show only the 3 most recent unlocked achievements
      setRecentAchievements(achievements.unlocked.slice(0, 3));
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.getUserAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const generateInsights = (data: AnalyticsData) => {
    const insights = [];
    
    if (data.patterns.bestDay) {
      insights.push(`Most active day: ${data.patterns.bestDay}`);
    }
    
    if (data.consistencyScore > 80) {
      insights.push('Consistency champion! 🏆');
    } else if (data.consistencyScore > 60) {
      insights.push('Good consistency! 👍');
    } else {
      insights.push('Keep building consistency 📈');
    }
    
    if (data.basicStats.current_streak >= 7) {
      insights.push(`${data.basicStats.current_streak}-day streak! 🔥`);
    }

    return insights.slice(0, 3); // Show max 3 insights
  };

  const handleCheckIn = async () => {
    if (!canCheckIn) return;
    
    setIsLoading(true);
    setSuccessMessage('');

    try {
      const response = await sessionAPI.addSession();
      setSuccessMessage(response.message);
      
      // Refresh user data
      const updatedUser = await userAPI.getProfile();
      updateUser(updatedUser);
      
      // Refresh achievements in case new ones were unlocked
      loadRecentAchievements();
      
      setCanCheckIn(false);
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSession = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to level up? 😏",
      "Time to gain some XP! 💪", 
      "Your crew is waiting! 🔥",
      "Keep the streak alive! ⚡",
      "Show them who's boss! 👑",
      "Climb the ranks! 🚀",
      "Earn that XP! 💎"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <HomeContainer>
      {/* Level Section at Top */}
      <LevelSection>
        <LevelBadge>Level {user?.level || 1}</LevelBadge>
        <ExperienceInfo>{user?.experience || 0} XP</ExperienceInfo>
        
        {user?.levelProgress && (
          <>
            <ExperienceBar>
              <ExperienceProgress percentage={user.levelProgress.percentage} />
            </ExperienceBar>
            <ExperienceInfo>
              {user.levelProgress.current} / {user.levelProgress.needed} XP to next level
            </ExperienceInfo>
          </>
        )}
      </LevelSection>

      {/* Check-in Section in Middle */}
      <CheckInSection>
        <CheckInText>
          {canCheckIn ? getMotivationalMessage() : "Already cranked today! 🎉"}
        </CheckInText>
        
        <CheckInButton
          skin={user?.active_skin}
          onClick={handleCheckIn}
          disabled={!canCheckIn || isLoading}
        >
          {isLoading ? '⏳' : canCheckIn ? '🍆' : '✅'}
        </CheckInButton>
        
        <CheckInLabel>
          {canCheckIn ? 'Tap to Crank!' : 'Come back tomorrow!'}
        </CheckInLabel>
        
        {successMessage && (
          <SuccessMessage>{successMessage}</SuccessMessage>
        )}
        
        {user?.last_session && (
          <LastSessionText>
            Last session: {formatLastSession(user.last_session)}
          </LastSessionText>
        )}
      </CheckInSection>

      {/* Stats Section Below */}
      <StatsGrid>
        <StatItem>
          <StatNumber>{user?.total_sessions || 0}</StatNumber>
          <StatLabel>Total Sessions</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{user?.current_streak || 0}</StatNumber>
          <StatLabel>Current Streak</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{user?.longest_streak || 0}</StatNumber>
          <StatLabel>Best Streak</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{user?.country || 'Unknown'}</StatNumber>
          <StatLabel>Country</StatLabel>
        </StatItem>
      </StatsGrid>

      {/* Analytics Section */}
      {analytics && (
        <AnalyticsSection>
          <AnalyticsHeader onClick={() => setAnalyticsExpanded(!analyticsExpanded)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon path={mdiChartLine} size={1} color="#667eea" />
              <span>Your Analytics</span>
            </div>
            <Icon 
              path={analyticsExpanded ? mdiChevronUp : mdiChevronDown} 
              size={1} 
              color="#667eea" 
            />
          </AnalyticsHeader>
          
          <AnalyticsContent expanded={analyticsExpanded}>
            <AnalyticsGrid>
              <AnalyticsItem>
                <AnalyticsNumber>Level {analytics.basicStats.level}</AnalyticsNumber>
                <AnalyticsLabel>Current Level</AnalyticsLabel>
              </AnalyticsItem>
              <AnalyticsItem>
                <AnalyticsNumber>{analytics.consistencyScore}%</AnalyticsNumber>
                <AnalyticsLabel>Consistency</AnalyticsLabel>
              </AnalyticsItem>
            </AnalyticsGrid>
            
            <InsightsList>
              {generateInsights(analytics).map((insight, index) => (
                <InsightItem key={index}>{insight}</InsightItem>
              ))}
            </InsightsList>
          </AnalyticsContent>
        </AnalyticsSection>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <RecentAchievements>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>🏆 Recent Achievements</h3>
          {recentAchievements.map((achievement) => (
            <AchievementItem key={achievement.id}>
              <AchievementEmoji>{achievement.badge_emoji}</AchievementEmoji>
              <AchievementInfo>
                <AchievementName>{achievement.name}</AchievementName>
                <AchievementDescription>{achievement.description}</AchievementDescription>
              </AchievementInfo>
              <AchievementReward>+{achievement.experience_reward} XP</AchievementReward>
            </AchievementItem>
          ))}
        </RecentAchievements>
      )}
    </HomeContainer>
  );
};