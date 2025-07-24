import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { leaderboardAPI, friendsAPI, reactionsAPI } from '../../services/api';
import { LeaderboardEntry } from '../../types';

const CommunityContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const TabsContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 10px;
  display: flex;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.1)'};
    color: ${props => props.active ? 'white' : '#667eea'};
  }
`;

const LeaderboardCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const LeaderboardTitle = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 1.5rem;
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const LeaderboardItem = styled.div<{ rank: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 15px;
  transition: transform 0.2s;
  
  ${props => {
    if (props.rank === 1) {
      return `
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #333;
        box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3);
      `;
    } else if (props.rank === 2) {
      return `
        background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
        color: #333;
        box-shadow: 0 10px 20px rgba(192, 192, 192, 0.3);
      `;
    } else if (props.rank === 3) {
      return `
        background: linear-gradient(135deg, #cd7f32, #daa520);
        color: #333;
        box-shadow: 0 10px 20px rgba(205, 127, 50, 0.3);
      `;
    } else {
      return `
        background: rgba(102, 126, 234, 0.1);
        color: #333;
      `;
    }
  }}

  &:hover {
    transform: translateY(-2px);
  }
`;

const RankBadge = styled.div<{ rank: number }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  
  ${props => {
    if (props.rank <= 3) {
      return `
        background: rgba(255, 255, 255, 0.3);
        color: #333;
      `;
    } else {
      return `
        background: #667eea;
        color: white;
      `;
    }
  }}
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserMeta = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LevelBadge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const SessionCount = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  color: #667eea;
  margin-right: 15px;
`;

const ReactionButtons = styled.div`
  display: flex;
  gap: 5px;
  margin-left: 10px;
`;

const ReactionButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: scale(1.2);
  }
`;

const AddFriendSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const AddFriendForm = styled.form`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const AddFriendInput = styled.input`
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const AddFriendButton = styled.button`
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
  font-style: italic;
`;

export const Community: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'country' | 'global'>('friends');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, user]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      let data: LeaderboardEntry[] = [];
      
      switch (activeTab) {
        case 'friends':
          data = await leaderboardAPI.getFriends();
          break;
        case 'country':
          if (user?.country) {
            data = await leaderboardAPI.getCountry(user.country);
          }
          break;
        case 'global':
          data = await leaderboardAPI.getGlobal();
          break;
      }
      
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendUsername.trim()) return;

    setAddFriendLoading(true);
    setMessage('');

    try {
      const response = await friendsAPI.addFriend(friendUsername.trim());
      setMessage(response.message);
      setFriendUsername('');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to add friend');
    } finally {
      setAddFriendLoading(false);
    }
  };

  const handleReaction = async (targetUsername: string, reactionType: string) => {
    if (!user) return;
    
    try {
      // For demo purposes, we'll use the username as targetUserId
      // In a real app, you'd need to get the actual user ID
      await reactionsAPI.addReaction(1, 'session', 1, reactionType);
      // Could show a brief success message or animation here
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'friends':
        return '👥 Friends Leaderboard';
      case 'country':
        return `🏴 ${user?.country || 'Country'} Leaderboard`;
      case 'global':
        return '🌍 Global Leaderboard';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case 'like': return '👍';
      case 'fire': return '🔥';
      case 'cheer': return '🎉';
      case 'wow': return '😮';
      default: return '👍';
    }
  };

  return (
    <CommunityContainer>
      <TabsContainer>
        <Tab active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>
          Friends
        </Tab>
        <Tab active={activeTab === 'country'} onClick={() => setActiveTab('country')}>
          Country
        </Tab>
        <Tab active={activeTab === 'global'} onClick={() => setActiveTab('global')}>
          Global
        </Tab>
      </TabsContainer>

      <LeaderboardCard>
        <LeaderboardTitle>{getTabTitle()}</LeaderboardTitle>
        
        {isLoading ? (
          <LoadingText>Loading leaderboard...</LoadingText>
        ) : leaderboard.length === 0 ? (
          <EmptyState>
            {activeTab === 'friends' 
              ? "No friends yet! Add some friends to see them here." 
              : "No data available for this leaderboard."}
          </EmptyState>
        ) : (
          <LeaderboardList>
            {leaderboard.map((entry, index) => (
              <LeaderboardItem key={`${entry.username}-${index}`} rank={index + 1}>
                <RankBadge rank={index + 1}>
                  {getRankEmoji(index + 1)}
                </RankBadge>
                <UserInfo>
                  <UserDetails>
                    <UserName>
                      {JSON.parse(entry.badges || '[]').join('')} {entry.username}
                      <LevelBadge>Lv.{entry.level}</LevelBadge>
                    </UserName>
                    <UserMeta>
                      <span>{entry.country}</span>
                      <span>•</span>
                      <span>Level {entry.level}</span>
                    </UserMeta>
                  </UserDetails>
                </UserInfo>
                <SessionCount>{entry.total_sessions} sessions</SessionCount>
                <ReactionButtons>
                  <ReactionButton
                    onClick={() => handleReaction(entry.username, 'like')}
                    title="Like"
                  >
                    {getReactionEmoji('like')}
                  </ReactionButton>
                  <ReactionButton
                    onClick={() => handleReaction(entry.username, 'fire')}
                    title="Fire"
                  >
                    {getReactionEmoji('fire')}
                  </ReactionButton>
                  <ReactionButton
                    onClick={() => handleReaction(entry.username, 'cheer')}
                    title="Cheer"
                  >
                    {getReactionEmoji('cheer')}
                  </ReactionButton>
                  <ReactionButton
                    onClick={() => handleReaction(entry.username, 'wow')}
                    title="Wow"
                  >
                    {getReactionEmoji('wow')}
                  </ReactionButton>
                </ReactionButtons>
              </LeaderboardItem>
            ))}
          </LeaderboardList>
        )}
      </LeaderboardCard>

      {activeTab === 'friends' && (
        <AddFriendSection>
          <h3>Add Friends</h3>
          <p>Enter a username to send a friend request:</p>
          <AddFriendForm onSubmit={handleAddFriend}>
            <AddFriendInput
              type="text"
              placeholder="Username"
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              disabled={addFriendLoading}
            />
            <AddFriendButton type="submit" disabled={addFriendLoading}>
              {addFriendLoading ? 'Adding...' : 'Add'}
            </AddFriendButton>
          </AddFriendForm>
          {message && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              borderRadius: '8px',
              background: message.includes('error') || message.includes('Failed') ? '#fee' : '#d4edda',
              color: message.includes('error') || message.includes('Failed') ? '#c33' : '#155724'
            }}>
              {message}
            </div>
          )}
        </AddFriendSection>
      )}
    </CommunityContainer>
  );
};