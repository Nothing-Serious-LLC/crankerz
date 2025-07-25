import React from 'react';
import styled from 'styled-components';

interface GlassCardProps {
  children: React.ReactNode;
  padding?: string;
  margin?: string;
  className?: string;
  onClick?: () => void;
}

const StyledGlassCard = styled.div<GlassCardProps>`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: ${props => props.padding || '20px'};
  margin: ${props => props.margin || '0'};
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  padding, 
  margin, 
  className, 
  onClick 
}) => {
  return (
    <StyledGlassCard 
      padding={padding} 
      margin={margin} 
      className={className}
      onClick={onClick}
    >
      {children}
    </StyledGlassCard>
  );
}; 