import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI, userAPI, achievementAPI, analyticsAPI } from '../../services/api';
import { Achievement, Analytics as AnalyticsData } from '../../types';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp, mdiChartLine } from '@mdi/js';
import confetti from 'canvas-confetti';
import { GlassCard } from '../Common/GlassCard';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const LevelPill = styled.div<{ skin?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 32px;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  min-width: 280px;
  
  ${props => {
    switch (props.skin) {
      case 'Fire Theme':
        return `background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);`;
      case 'Ocean Theme':
        return `background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);`;
      case 'Dark Mode Pro':
        return `background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);`;
      case 'Neon Glow':
        return `background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);`;
      case 'Forest Theme':
        return `background: linear-gradient(135deg, #228b22 0%, #32cd32 100%);`;
      case 'Sunset Glow':
        return `background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);`;
      case 'Ice Crystal':
        return `background: linear-gradient(135deg, #00bfff 0%, #87ceeb 100%);`;
      case 'Cosmic Purple':
        return `background: linear-gradient(135deg, #4b0082 0%, #8a2be2 100%);`;
      case 'Cherry Blossom':
        return `background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);`;
      case 'Midnight Black':
        return `background: linear-gradient(135deg, #000000 0%, #2c2c2c 100%);`;
      case 'Retro Wave':
        return `background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);`;
      case 'Minimalist White':
        return `background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); color: #333;`;
      case 'Gaming RGB':
        return `background: linear-gradient(135deg, #ff0000 0%, #00ff00 50%, #0000ff 100%);`;
      case 'Coffee Shop':
        return `background: linear-gradient(135deg, #8b4513 0%, #d2691e 100%);`;
      case 'Beach Sunset':
        return `background: linear-gradient(135deg, #ff8a80 0%, #ffcc02 100%);`;
      case 'Lava Flow':
        return `background: linear-gradient(135deg, #ff4500 0%, #8b0000 100%);`;
      case 'Electric Blue':
        return `background: linear-gradient(135deg, #0080ff 0%, #0040ff 100%);`;
      case 'Golden Hour':
        return `background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);`;
      case 'Matrix Green':
        return `background: linear-gradient(135deg, #00ff00 0%, #008000 100%);`;
      case 'Rose Gold':
        return `background: linear-gradient(135deg, #e8b4b8 0%, #d4af37 100%);`;
      default:
        return `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;
    }
  }}
  
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
`;

const LevelNumber = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 8px;
`;

const ExperienceInfo = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 12px;
`;

const ExperienceBarWrapper = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ExperienceProgress = styled.div<{ percentage: number }>`
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  width: ${props => props.percentage}%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
`;

const LevelProgressText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
`;

const CheckInWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`;

const MotivationalText = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const CheckInButton = styled.button<{ skin?: string; disabled?: boolean }>`
  width: 140px;
  height: 220px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-radius: 70px 70px 60px 60px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  font-size: 0;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  ${props => {
    switch (props.skin) {
      case 'Fire Theme':
        return `
          background: linear-gradient(180deg, #ff6b6b 0%, #ffa500 100%);
          box-shadow: 0 12px 40px rgba(255, 107, 107, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Ocean Theme':
        return `
          background: linear-gradient(180deg, #4ecdc4 0%, #44a08d 100%);
          box-shadow: 0 12px 40px rgba(78, 205, 196, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Dark Mode Pro':
        return `
          background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
          box-shadow: 0 12px 40px rgba(44, 62, 80, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.1);
        `;
      case 'Neon Glow':
        return `
          background: linear-gradient(180deg, #ff00ff 0%, #00ffff 100%);
          box-shadow: 0 12px 40px rgba(255, 0, 255, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Forest Theme':
        return `
          background: linear-gradient(180deg, #228b22 0%, #32cd32 100%);
          box-shadow: 0 12px 40px rgba(34, 139, 34, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Sunset Glow':
        return `
          background: linear-gradient(180deg, #ff7e5f 0%, #feb47b 100%);
          box-shadow: 0 12px 40px rgba(255, 126, 95, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Ice Crystal':
        return `
          background: linear-gradient(180deg, #00bfff 0%, #87ceeb 100%);
          box-shadow: 0 12px 40px rgba(0, 191, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Cosmic Purple':
        return `
          background: linear-gradient(180deg, #4b0082 0%, #8a2be2 100%);
          box-shadow: 0 12px 40px rgba(75, 0, 130, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Cherry Blossom':
        return `
          background: linear-gradient(180deg, #ffb6c1 0%, #ffc0cb 100%);
          box-shadow: 0 12px 40px rgba(255, 182, 193, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Midnight Black':
        return `
          background: linear-gradient(180deg, #000000 0%, #2c2c2c 100%);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8), inset 0 2px 0 rgba(255, 255, 255, 0.1);
        `;
      case 'Retro Wave':
        return `
          background: linear-gradient(180deg, #ff006e 0%, #8338ec 100%);
          box-shadow: 0 12px 40px rgba(255, 0, 110, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Minimalist White':
        return `
          background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
          box-shadow: 0 12px 40px rgba(233, 236, 239, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.8);
          color: #333;
        `;
      case 'Gaming RGB':
        return `
          background: linear-gradient(180deg, #ff0000 0%, #00ff00 50%, #0000ff 100%);
          box-shadow: 0 12px 40px rgba(255, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Coffee Shop':
        return `
          background: linear-gradient(180deg, #8b4513 0%, #d2691e 100%);
          box-shadow: 0 12px 40px rgba(139, 69, 19, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Beach Sunset':
        return `
          background: linear-gradient(180deg, #ff8a80 0%, #ffcc02 100%);
          box-shadow: 0 12px 40px rgba(255, 138, 128, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Lava Flow':
        return `
          background: linear-gradient(180deg, #ff4500 0%, #8b0000 100%);
          box-shadow: 0 12px 40px rgba(255, 69, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Electric Blue':
        return `
          background: linear-gradient(180deg, #0080ff 0%, #0040ff 100%);
          box-shadow: 0 12px 40px rgba(0, 128, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Golden Hour':
        return `
          background: linear-gradient(180deg, #ffd700 0%, #ff8c00 100%);
          box-shadow: 0 12px 40px rgba(255, 215, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Matrix Green':
        return `
          background: linear-gradient(180deg, #00ff00 0%, #008000 100%);
          box-shadow: 0 12px 40px rgba(0, 255, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      case 'Rose Gold':
        return `
          background: linear-gradient(180deg, #e8b4b8 0%, #d4af37 100%);
          box-shadow: 0 12px 40px rgba(232, 180, 184, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
      default:
        return `
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
        `;
    }
  }}
  
  &:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 16px 50px rgba(102, 126, 234, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-2px) scale(1.01);
  }
  
  /* Button head */
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 40px;
    background: inherit;
    border-radius: 25px 25px 20px 20px;
    border: inherit;
    border-bottom: none;
  }
`;

const HoldProgress = styled.div<{ progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${props => props.progress}%;
  background: rgba(255, 255, 255, 0.3);
  transition: height 0.1s ease;
  pointer-events: none;
  border-radius: inherit;
`;

const CheckInLabel = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const RechargeTimer = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
`;

const SuccessMessage = styled.div`
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
`;

const LastSessionText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin: 8px 0 0 0;
  font-weight: 400;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 20px;
`;

const StatNumber = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const CountryStatNumber = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
`;

const AchievementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AchievementEmoji = styled.div`
  font-size: 2.2rem;
  line-height: 1;
`;

const AchievementInfo = styled.div`
  flex: 1;
`;

const AchievementName = styled.div`
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 4px;
`;

const AchievementDescription = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
`;

const AchievementReward = styled.div`
  background: rgba(102, 126, 234, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

export const Home: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<number>(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if 5 minutes have passed since last check-in
    const checkCanCheckIn = () => {
      if (user?.last_session) {
        const lastSession = new Date(user.last_session);
        const now = new Date();
        const timeDiff = now.getTime() - lastSession.getTime();
        const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        if (timeDiff < fiveMinutesInMs) {
          setCanCheckIn(false);
          const remainingTime = Math.ceil((fiveMinutesInMs - timeDiff) / 1000);
          setTimeUntilNext(remainingTime);
        } else {
          setCanCheckIn(true);
          setTimeUntilNext(0);
        }
      } else {
        setCanCheckIn(true);
        setTimeUntilNext(0);
      }
    };

    checkCanCheckIn();

    // Update timer every second when user can't check in
    const interval = setInterval(() => {
      if (!canCheckIn && timeUntilNext > 0) {
        setTimeUntilNext(prev => {
          if (prev <= 1) {
            setCanCheckIn(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    // Load recent achievements and analytics
    loadRecentAchievements();
    loadAnalytics();

    return () => clearInterval(interval);
  }, [user, canCheckIn, timeUntilNext]);

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

  const startHold = () => {
    if (!canCheckIn || isLoading) return;
    if (holdInterval.current) return;
    
    holdInterval.current = setInterval(() => {
      setHoldProgress(prev => {
        const next = prev + 2.5; // 40 steps = 1 second
        if (next >= 100) {
          clearInterval(holdInterval.current as NodeJS.Timeout);
          holdInterval.current = null;
          handleCheckIn();
          return 0; // reset after completion
        }
        return next;
      });
    }, 25); // 40fps for smooth animation
  };

  const cancelHold = () => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
    setHoldProgress(0);
  };

  const handleCheckIn = async () => {
    if (!canCheckIn || isLoading) return;

    setIsLoading(true);
    setHoldProgress(0);

    try {
      const response = await sessionAPI.addSession();
      setSuccessMessage(response.message || 'Session logged successfully! 🔥');
      setCanCheckIn(false);
      setTimeUntilNext(300); // 5 minutes in seconds
      
      // Launch confetti celebration
      launchConfetti();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh user data
      const updatedUser = await userAPI.getProfile();
      updateUser(updatedUser);
      
      // Reload achievements in case new ones were unlocked
      loadRecentAchievements();
    } catch (error) {
      console.error('Check-in failed:', error);
      setSuccessMessage('Failed to log session. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const launchConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatLastSession = (lastSession: string): string => {
    const sessionDate = new Date(lastSession);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const getMotivationalMessage = () => {
    // Always show a consistent message, no countdown here
    const messages = [
      "Ready to level up? 😏",
      "Time to gain some XP! 💪", 
      "Your crew is waiting! 🔥",
      "Keep the streak alive! ⚡",
      "Show them who's boss! 👑",
      "Climb the ranks! 🚀",
      "Earn that XP! 💎"
    ];
    // Use a consistent message based on user level to avoid flickering
    const messageIndex = (user?.level || 1) % messages.length;
    return messages[messageIndex];
  };

  return (
    <HomeContainer>
      {/* Level Pill */}
      <LevelPill skin={user?.active_skin}>
        <LevelNumber>Level {user?.level || 1}</LevelNumber>
        <ExperienceInfo>{user?.experience || 0} XP</ExperienceInfo>
        
        {user?.levelProgress && (
          <>
            <ExperienceBarWrapper>
              <ExperienceProgress percentage={user.levelProgress.percentage} />
            </ExperienceBarWrapper>
            <LevelProgressText>
              {user.levelProgress.current} / {user.levelProgress.needed} XP to next level
            </LevelProgressText>
          </>
        )}
      </LevelPill>

      {/* Check-in Section */}
      <GlassCard padding="32px">
        <CheckInWrapper>
          <MotivationalText>{getMotivationalMessage()}</MotivationalText>
          
          <CheckInButton
            skin={user?.active_skin}
            onMouseDown={startHold}
            onTouchStart={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchEnd={cancelHold}
            disabled={!canCheckIn || isLoading}
          >
            {isLoading ? '⏳' : canCheckIn ? '' : '🔒'}
            <HoldProgress progress={holdProgress} />
          </CheckInButton>
          
          <CheckInLabel>
            {canCheckIn ? 'Hold to Crank!' : 'Recharging...'}
          </CheckInLabel>
          
          {!canCheckIn && timeUntilNext > 0 && (
            <RechargeTimer>{formatTimeRemaining(timeUntilNext)}</RechargeTimer>
          )}
          
          {successMessage && (
            <SuccessMessage>{successMessage}</SuccessMessage>
          )}
          
          {user?.last_session && (
            <LastSessionText>
              Last session: {formatLastSession(user.last_session)}
            </LastSessionText>
          )}
        </CheckInWrapper>
      </GlassCard>

      {/* Stats Grid */}
      <StatsGrid>
        <GlassCard padding="0">
          <StatItem>
            <StatNumber>{user?.total_sessions || 0}</StatNumber>
            <StatLabel>Total Sessions</StatLabel>
          </StatItem>
        </GlassCard>
        <GlassCard padding="0">
          <StatItem>
            <StatNumber>{user?.current_streak || 0}</StatNumber>
            <StatLabel>Current Streak</StatLabel>
          </StatItem>
        </GlassCard>
        <GlassCard padding="0">
          <StatItem>
            <StatNumber>{user?.longest_streak || 0}</StatNumber>
            <StatLabel>Best Streak</StatLabel>
          </StatItem>
        </GlassCard>
        <GlassCard padding="0">
          <StatItem>
            <CountryStatNumber>{user?.country || 'Unknown'}</CountryStatNumber>
            <StatLabel>Country</StatLabel>
          </StatItem>
        </GlassCard>
      </StatsGrid>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <GlassCard>
          <SectionTitle>🏆 Recent Achievements</SectionTitle>
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
        </GlassCard>
      )}
    </HomeContainer>
  );
};