import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Analytics as AnalyticsData } from '../../types';
import { analyticsAPI } from '../../services/api';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
`;

const Subtitle = styled.p`
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

const StatNumber = styled.div`
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

const ChartSection = styled.div`
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

const BarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

const Bar = styled.div<{ height: number }>`
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: ${props => props.height}px;
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
  font-size: 0.8rem;
  color: #666;
`;

const BarValue = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
`;

const TrendChart = styled.div`
  display: flex;
  align-items: end;
  gap: 15px;
  height: 150px;
  margin-bottom: 20px;
`;

const TrendPoint = styled.div<{ left: string; height: string }>`
  position: absolute;
  left: ${props => props.left};
  bottom: 0;
  width: 10px;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  border-radius: 8px;
  min-height: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const TrendValue = styled.div`
  font-size: 0.8rem;
  color: #333;
  font-weight: 600;
`;

const TrendMonth = styled.div`
  font-size: 0.7rem;
  color: #666;
  margin-top: 5px;
`;

const InsightsSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const InsightsTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InsightCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
`;

const JoinedDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #F44336;
  font-weight: bold;
  padding: 40px;
`;

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsAPI.getUserAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  const generateInsights = (data: AnalyticsData) => {
    const insights = [];
    
    if (data.patterns.bestDay) {
      insights.push(`Your most active day is ${data.patterns.bestDay}`);
    }
    
    if (data.patterns.bestHour !== undefined) {
      const hour = data.patterns.bestHour;
      const timeStr = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      insights.push(`Peak performance time: ${timeStr}`);
    }
    
    if (data.consistencyScore > 80) {
      insights.push('Consistency champion! 🏆');
    } else if (data.consistencyScore > 60) {
      insights.push('Good consistency, keep it up! 👍');
    } else {
      insights.push('Room for improvement in consistency 📈');
    }
    
    if (data.basicStats.current_streak >= 7) {
      insights.push(`Amazing ${data.basicStats.current_streak}-day streak! 🔥`);
    }

    return insights;
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Loading your analytics...</LoadingMessage>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container>
        <ErrorMessage>Failed to load analytics. Please try again.</ErrorMessage>
      </Container>
    );
  }

  const insights = generateInsights(analytics);

  return (
    <Container>
      <Header>
        <Title>📊 Your Analytics</Title>
        <Subtitle>Track your progress and patterns</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{analytics.basicStats.total_sessions}</StatNumber>
          <StatLabel>Total Sessions</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>Level {analytics.basicStats.level}</StatNumber>
          <StatLabel>Current Level</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{analytics.consistencyScore}%</StatNumber>
          <StatLabel>Consistency Score</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{analytics.basicStats.longest_streak}</StatNumber>
          <StatLabel>Best Streak</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartSection>
        <ChartTitle>📅 Activity by Day of Week</ChartTitle>
        <BarChart>
          {analytics.patterns.dayCounts.map((count, index) => (
            <BarContainer key={index}>
              <Bar height={Math.max(count * 10, 5)} />
              <BarLabel>{getDayName(index)}</BarLabel>
              <BarValue>{count}</BarValue>
            </BarContainer>
          ))}
        </BarChart>
      </ChartSection>

      <ChartSection>
        <ChartTitle>📈 Monthly Trends</ChartTitle>
        <TrendChart>
          {analytics.monthlyTrends.map((trend, index) => (
            <TrendPoint
              key={trend.month}
              left={`${(index / (analytics.monthlyTrends.length - 1)) * 100}%`}
              height={`${Math.max(trend.sessions * 3, 10)}px`}
            >
              <TrendValue>{trend.sessions}</TrendValue>
              <TrendMonth>{new Date(trend.month + '-01').toLocaleDateString('default', { month: 'short' })}</TrendMonth>
            </TrendPoint>
          ))}
        </TrendChart>
      </ChartSection>

      <InsightsSection>
        <InsightsTitle>💡 Insights</InsightsTitle>
        {insights.map((insight, index) => (
          <InsightCard key={index}>
            {insight}
          </InsightCard>
        ))}
      </InsightsSection>

      <JoinedDate>
        Member since {formatDate(analytics.basicStats.join_date)}
      </JoinedDate>
    </Container>
  );
};