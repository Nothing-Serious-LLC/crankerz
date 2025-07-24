import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { storeAPI } from '../../services/api';
import { StoreItem } from '../../types';

const StoreContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const StoreHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const StoreTitle = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
`;

const StoreSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const PointsDisplay = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  display: inline-block;
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

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ItemCard = styled.div<{ owned: boolean }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  border: ${props => props.owned ? '3px solid #4CAF50' : '3px solid transparent'};
  position: relative;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ItemImage = styled.div<{ type: string; name: string }>`
  width: 100%;
  height: 120px;
  border-radius: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  
  ${props => {
    if (props.type === 'skin') {
      switch (props.name.toLowerCase()) {
        case 'fire theme':
          return `background: linear-gradient(45deg, #ff6b6b, #ffa500);`;
        case 'ocean theme':
          return `background: linear-gradient(45deg, #4ecdc4, #44a08d);`;
        case 'dark mode pro':
          return `background: linear-gradient(45deg, #2c3e50, #34495e);`;
        case 'neon glow':
          return `background: linear-gradient(45deg, #ff00ff, #00ffff);`;
        default:
          return `background: linear-gradient(45deg, #667eea, #764ba2);`;
      }
    } else {
      return `background: linear-gradient(45deg, #f093fb, #f5576c);`;
    }
  }}
`;

const ItemName = styled.h3`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.2rem;
`;

const ItemDescription = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ItemPrice = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const Price = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: #667eea;
`;

const PurchaseButton = styled.button<{ owned: boolean }>`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  ${props => props.owned ? `
    background: #4CAF50;
    color: white;
    cursor: default;
  ` : `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
  `}
`;

const OwnedBadge = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: #4CAF50;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
  font-style: italic;
`;

export const Store: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'skins' | 'badges'>('skins');
  const [items, setItems] = useState<StoreItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    setIsLoading(true);
    try {
      const [storeItems, purchases] = await Promise.all([
        storeAPI.getItems(),
        storeAPI.getPurchases()
      ]);
      
      setItems(storeItems);
      setOwnedItems(purchases);
    } catch (error) {
      console.error('Failed to load store data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (item: StoreItem) => {
    if (isItemOwned(item.id) || !canAfford(item.price)) return;

    setPurchaseLoading(item.id);
    try {
      await storeAPI.purchaseItem(item.id);
      await loadStoreData(); // Refresh data
    } catch (error: any) {
      console.error('Purchase failed:', error);
      alert(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const isItemOwned = (itemId: number) => {
    return ownedItems.some(item => item.id === itemId);
  };

  const canAfford = (price: number) => {
    return (user?.total_sessions || 0) >= price;
  };

  const getFilteredItems = () => {
    return items.filter(item => item.type === activeTab);
  };

  const getItemEmoji = (item: StoreItem) => {
    if (item.type === 'skin') {
      return '🎨';
    } else {
      return item.name.split(' ')[0]; // First emoji from name
    }
  };

  if (isLoading) {
    return (
      <StoreContainer>
        <LoadingText>Loading store...</LoadingText>
      </StoreContainer>
    );
  }

  return (
    <StoreContainer>
      <StoreHeader>
        <StoreTitle>🛒 FapTracker Store</StoreTitle>
        <StoreSubtitle>Customize your experience with skins and badges!</StoreSubtitle>
        <PointsDisplay>
          💎 {user?.total_sessions || 0} Points Available
        </PointsDisplay>
      </StoreHeader>

      <TabsContainer>
        <Tab active={activeTab === 'skins'} onClick={() => setActiveTab('skins')}>
          🎨 Skins
        </Tab>
        <Tab active={activeTab === 'badges'} onClick={() => setActiveTab('badges')}>
          🏆 Badges
        </Tab>
      </TabsContainer>

      {getFilteredItems().length === 0 ? (
        <EmptyState>
          No {activeTab} available at the moment.
        </EmptyState>
      ) : (
        <ItemsGrid>
          {getFilteredItems().map((item) => {
            const owned = isItemOwned(item.id);
            const affordable = canAfford(item.price);
            const purchasing = purchaseLoading === item.id;

            return (
              <ItemCard key={item.id} owned={owned}>
                {owned && <OwnedBadge>✅ Owned</OwnedBadge>}
                
                <ItemImage type={item.type} name={item.name}>
                  {getItemEmoji(item)}
                </ItemImage>
                
                <ItemName>{item.name}</ItemName>
                <ItemDescription>{item.description}</ItemDescription>
                
                <ItemPrice>
                  <Price>💎 {item.price}</Price>
                  {!affordable && !owned && (
                    <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                      Need {item.price - (user?.total_sessions || 0)} more
                    </span>
                  )}
                </ItemPrice>
                
                <PurchaseButton
                  owned={owned}
                  onClick={() => handlePurchase(item)}
                  disabled={owned || !affordable || purchasing}
                >
                  {purchasing ? 'Purchasing...' : owned ? 'Owned' : affordable ? 'Purchase' : 'Not enough points'}
                </PurchaseButton>
              </ItemCard>
            );
          })}
        </ItemsGrid>
      )}
    </StoreContainer>
  );
};