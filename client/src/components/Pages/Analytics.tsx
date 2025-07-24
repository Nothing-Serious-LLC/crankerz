import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { analyticsAPI } from '../../services/api';
import { Analytics } from '../../types';

const AnalyticsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const AnalyticsHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const AnalyticsTitle = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
`;

const AnalyticsSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.3rem;
`;

const BarChart = styled.div`
  display: flex;
  align-items: end;
  gap: 8px;
  height: 200px;
  margin-bottom: 20px;
`;

const Bar = styled.div<{ height: number; color?: string }>`
  flex: 1;
  background: ${props => props.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  height: ${props => props.height}%;
  border-radius: 4px 4px 0 0;
  min-height: 5px;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;

const BarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
  margin-top: 10px;
`;

const InsightCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const InsightTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InsightText = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
`;

const HighlightText = styled.span`
  color: #667eea;
  font-weight: 600;
`;

const LoadingState = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px;
`;

const TrendChart = styled.div`
  display: flex;
  align-items: end;
  gap: 15px;
  height: 150px;
  margin-bottom: 20px;
`;

const TrendBar = styled.div<{ height: number }>`
  flex: 1;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  height: ${props => props.height}%;
  border-radius: 8px;
  min-height: 10px;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const TrendLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
  margin-top: 10px;
`;

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.getUserAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getDayName = (index: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index];
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getInsights = () => {
    if (!analytics) return [];

    const insights = [];
    const { patterns, basicStats, consistencyScore } = analytics;

    // Best time insight
    insights.push({
      icon: '⏰',
      title: 'Peak Performance Time',
      text: `Your most active time is ${formatHour(patterns.bestHour)} on ${patterns.bestDay}s. Consider scheduling important activities around your natural rhythm.`
    });

    // Consistency insight
    if (consistencyScore >= 80) {
      insights.push({
        icon: '🎯',
        title: 'Consistency Champion',
        text: `Your consistency score of ${consistencyScore}% puts you in the top tier! You're maintaining excellent habits.`
      });
    } else if (consistencyScore >= 60) {
      insights.push({
        icon: '📈',
        title: 'Room for Improvement',
        text: `Your consistency score is ${consistencyScore}%. Try to maintain more regular patterns to boost your performance.`
      });
    } else {
      insights.push({
        icon: '🚀',
        title: 'Getting Started',
        text: `Your consistency score is ${consistencyScore}%. Focus on building daily habits to see dramatic improvements.`
      });
    }

    // Streak insight
    if (basicStats.longest_streak >= 7) {
      insights.push({
        icon: '🔥',
        title: 'Streak Master',
        text: `Your longest streak of ${basicStats.longest_streak} days shows you have great discipline. Keep pushing those limits!`
      });
    }

    return insights;
  };

  if (isLoading) {
    return (
      <AnalyticsContainer>
        <LoadingState>Loading your analytics...</LoadingState>
      </AnalyticsContainer>
    );
  }

  if (!analytics) {
    return (
      <AnalyticsContainer>
        <LoadingState>Unable to load analytics data.</LoadingState>
      </AnalyticsContainer>
    );
  }

  const maxDayCount = Math.max(...analytics.patterns.dayCounts);
  const maxMonthSessions = Math.max(...analytics.monthlyTrends.map(m => m.sessions));

  return (
    <AnalyticsContainer>
      <AnalyticsHeader>
        <AnalyticsTitle>📊 Your Analytics</AnalyticsTitle>
        <AnalyticsSubtitle>Deep insights into your patterns and progress</AnalyticsSubtitle>
      </AnalyticsHeader>

      <StatsGrid>
        <StatCard>
          <StatValue>{analytics.basicStats.total_sessions}</StatValue>
          <StatLabel>Total Sessions</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{analytics.basicStats.level}</StatValue>
          <StatLabel>Current Level</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{analytics.consistencyScore}%</StatValue>
          <StatLabel>Consistency Score</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{analytics.basicStats.longest_streak}</StatValue>
          <StatLabel>Best Streak</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartCard>
        <ChartTitle>📅 Activity by Day of Week</ChartTitle>
        <BarChart>
          {analytics.patterns.dayCounts.map((count, index) => (
            <Bar
              key={index}
              height={maxDayCount > 0 ? (count / maxDayCount) * 100 : 0}
              color={count === maxDayCount ? 'linear-gradient(135deg, #ff6b6b, #ffa500)' : undefined}
            />
          ))}
        </BarChart>
        <BarLabel>
          {analytics.patterns.dayCounts.map((count, index) => (
            <div key={index}>
              <div>{getDayName(index)}</div>
              <div style={{ fontWeight: '600', color: '#333' }}>{count}</div>
            </div>
          ))}
        </BarLabel>
      </ChartCard>

      {analytics.monthlyTrends.length > 0 && (
        <ChartCard>
          <ChartTitle>📈 Monthly Trends</ChartTitle>
          <TrendChart>
            {analytics.monthlyTrends.map((trend, index) => (
              <TrendBar
                key={index}
                height={maxMonthSessions > 0 ? (trend.sessions / maxMonthSessions) * 100 : 0}
              />
            ))}
          </TrendChart>
          <TrendLabel>
            {analytics.monthlyTrends.map((trend, index) => (
              <div key={index}>
                <div>{trend.month}</div>
                <div style={{ fontWeight: '600', color: '#333' }}>{trend.sessions}</div>
              </div>
            ))}
          </TrendLabel>
        </ChartCard>
      )}

      {getInsights().map((insight, index) => (
        <InsightCard key={index}>
          <InsightTitle>
            <span>{insight.icon}</span>
            {insight.title}
          </InsightTitle>
          <InsightText>{insight.text}</InsightText>
        </InsightCard>
      ))}

      <InsightCard>
        <InsightTitle>
          <span>🎯</span>
          Quick Stats
        </InsightTitle>
        <InsightText>
          Most active day: <HighlightText>{analytics.patterns.bestDay}</HighlightText>
        </InsightText>
        <InsightText>
          Peak hour: <HighlightText>{formatHour(analytics.patterns.bestHour)}</HighlightText>
        </InsightText>
        <InsightText>
          Member since: <HighlightText>{new Date(analytics.basicStats.join_date).toLocaleDateString()}</HighlightText>
        </InsightText>
        <InsightText>
          Consistency score: <HighlightText style={{ color: getConsistencyColor(analytics.consistencyScore) }}>
            {analytics.consistencyScore}%
          </HighlightText>
        </InsightText>
      </InsightCard>
    </AnalyticsContainer>
  );
};