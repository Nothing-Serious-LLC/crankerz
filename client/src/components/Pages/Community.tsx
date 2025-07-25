import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { leaderboardAPI, friendsAPI, reactionsAPI } from '../../services/api';
import { LeaderboardEntry } from '../../types';
import { GlassCard } from '../Common/GlassCard';

const CommunityContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 16px 12px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active 
    ? 'rgba(102, 126, 234, 0.8)' 
    : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active 
    ? 'white' 
    : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.active 
    ? 'rgba(102, 126, 234, 0.5)' 
    : 'rgba(255, 255, 255, 0.1)'};
  text-shadow: ${props => props.active 
    ? '0 1px 2px rgba(0, 0, 0, 0.2)' 
    : 'none'};

  &:hover {
    background: ${props => props.active 
      ? 'rgba(102, 126, 234, 0.9)' 
      : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-1px);
  }
`;

const LeaderboardTitle = styled.h2`
  text-align: center;
  margin: 0 0 24px 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LeaderboardItem = styled.div<{ rank: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  ${props => {
    if (props.rank === 1) {
      return `
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 237, 78, 0.9));
        color: #333;
        box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
        border-color: rgba(255, 215, 0, 0.3);
      `;
    } else if (props.rank === 2) {
      return `
        background: linear-gradient(135deg, rgba(192, 192, 192, 0.9), rgba(232, 232, 232, 0.9));
        color: #333;
        box-shadow: 0 8px 32px rgba(192, 192, 192, 0.3);
        border-color: rgba(192, 192, 192, 0.3);
      `;
    } else if (props.rank === 3) {
      return `
        background: linear-gradient(135deg, rgba(205, 127, 50, 0.9), rgba(218, 165, 32, 0.9));
        color: #333;
        box-shadow: 0 8px 32px rgba(205, 127, 50, 0.3);
        border-color: rgba(205, 127, 50, 0.3);
      `;
    } else {
      return `
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
      `;
    }
  }}

  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: ${props => {
      if (props.rank === 1) return '0 12px 40px rgba(255, 215, 0, 0.4)';
      if (props.rank === 2) return '0 12px 40px rgba(192, 192, 192, 0.4)';
      if (props.rank === 3) return '0 12px 40px rgba(205, 127, 50, 0.4)';
      return '0 8px 32px rgba(255, 255, 255, 0.1)';
    }};
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RankBadge = styled.div<{ rank: number }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  
  ${props => {
    if (props.rank === 1) {
      return `
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #333;
        box-shadow: 0 4px 16px rgba(255, 215, 0, 0.4);
      `;
    } else if (props.rank === 2) {
      return `
        background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
        color: #333;
        box-shadow: 0 4px 16px rgba(192, 192, 192, 0.4);
      `;
    } else if (props.rank === 3) {
      return `
        background: linear-gradient(135deg, #CD7F32, #B8860B);
        color: #333;
        box-shadow: 0 4px 16px rgba(205, 127, 50, 0.4);
      `;
    } else {
      return `
        background: rgba(102, 126, 234, 0.8);
        color: white;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
      `;
    }
  }}
`;

const PlayerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PlayerName = styled.div<{ rank: number }>`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${props => props.rank <= 3 ? '#333' : 'rgba(255, 255, 255, 0.95)'};
`;

const PlayerCountry = styled.div<{ rank: number }>`
  font-size: 0.8rem;
  color: ${props => props.rank <= 3 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PlayerStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const SessionCount = styled.div<{ rank: number }>`
  font-weight: 700;
  font-size: 1.2rem;
  color: ${props => props.rank <= 3 ? '#333' : 'rgba(255, 255, 255, 0.95)'};
`;

const LevelBadge = styled.div<{ rank: number }>`
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 600;
  background: ${props => props.rank <= 3 
    ? 'rgba(0, 0, 0, 0.1)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.rank <= 3 ? '#333' : 'rgba(255, 255, 255, 0.8)'};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  font-style: italic;
`;

export const Community: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'country' | 'friends'>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, user]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      let data: LeaderboardEntry[] = [];
      
      switch (activeTab) {
        case 'global':
          data = await leaderboardAPI.getGlobal();
          break;
        case 'country':
          if (user?.country) {
            data = await leaderboardAPI.getCountry(user.country);
          }
          break;
        case 'friends':
          data = await leaderboardAPI.getFriends();
          break;
      }
      
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  };

  return (
    <CommunityContainer>
      {/* Tabs */}
      <GlassCard padding="16px">
        <TabsContainer>
          <Tab 
            active={activeTab === 'global'} 
            onClick={() => setActiveTab('global')}
          >
            🌍 Global
          </Tab>
          <Tab 
            active={activeTab === 'country'} 
            onClick={() => setActiveTab('country')}
          >
            🏳️ {user?.country || 'Country'}
          </Tab>
          <Tab 
            active={activeTab === 'friends'} 
            onClick={() => setActiveTab('friends')}
          >
            👥 Friends
          </Tab>
        </TabsContainer>
      </GlassCard>

      {/* Leaderboard */}
      <GlassCard>
        <LeaderboardTitle>
          {activeTab === 'global' && '🏆 Global Leaderboard'}
          {activeTab === 'country' && `🏳️ ${user?.country || 'Country'} Leaderboard`}
          {activeTab === 'friends' && '👥 Friends Leaderboard'}
        </LeaderboardTitle>

        {loading ? (
          <LoadingMessage>Loading leaderboard...</LoadingMessage>
        ) : leaderboard.length > 0 ? (
          <LeaderboardList>
            {leaderboard.map((player, index) => {
              const rank = index + 1;
              return (
                <LeaderboardItem key={`${player.username}-${rank}`} rank={rank}>
                  <PlayerInfo>
                    <RankBadge rank={rank}>
                      {getRankIcon(rank)}
                    </RankBadge>
                    <PlayerDetails>
                      <PlayerName rank={rank}>{player.username}</PlayerName>
                      <PlayerCountry rank={rank}>{player.country}</PlayerCountry>
                    </PlayerDetails>
                  </PlayerInfo>
                  <PlayerStats>
                    <SessionCount rank={rank}>
                      {player.total_sessions} sessions
                    </SessionCount>
                    <LevelBadge rank={rank}>
                      Level {player.level}
                    </LevelBadge>
                  </PlayerStats>
                </LeaderboardItem>
              );
            })}
          </LeaderboardList>
        ) : (
          <EmptyMessage>
            {activeTab === 'friends' 
              ? 'No friends yet! Add some friends to see them here.' 
              : 'No players found in this leaderboard.'}
          </EmptyMessage>
        )}
      </GlassCard>
    </CommunityContainer>
  );
};