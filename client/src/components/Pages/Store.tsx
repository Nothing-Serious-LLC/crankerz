import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { storeAPI } from '../../services/api';
import { StoreItem } from '../../types';
import { GlassCard } from '../Common/GlassCard';

const StoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const StoreTitle = styled.h1`
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const StoreSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 8px 0 0 0;
  text-align: center;
  font-weight: 500;
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 20px;
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

const TabsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 100%;
`;

const Tab = styled.button<{ active: boolean }>`
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

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  width: 100%;
`;

const ItemCard = styled.div<{ equipped?: boolean }>`
  position: relative;
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
  
  ${props => props.equipped && `
    &::before {
      content: '✓';
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(76, 175, 80, 0.9);
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  `}

  &:hover {
    transform: translateY(-4px) scale(1.02);
  }
`;

const ItemImage = styled.div<{ type: string }>`
  height: 120px;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  
  ${props => {
    switch (props.type) {
      case 'skin':
        return `background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);`;
      case 'badge':
        return `background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);`;
      case 'avatar':
        return `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;
      case 'theme':
        return `background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);`;
      default:
        return `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;
    }
  }}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  ${ItemCard}:hover &::before {
    opacity: 1;
  }
`;

const ItemContent = styled.div`
  padding: 16px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.3;
`;

const ItemDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  flex-grow: 1;
`;

const ItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const ItemPrice = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(102, 126, 234, 0.6);
  padding: 6px 12px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const PurchaseButton = styled.button<{ purchased?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.purchased ? `
    background: rgba(76, 175, 80, 0.8);
    color: white;
    cursor: default;
  ` : `
    background: rgba(102, 126, 234, 0.8);
    color: white;
    
    &:hover {
      background: rgba(102, 126, 234, 0.9);
      transform: translateY(-1px);
    }
  `}
`;

const EquipButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 193, 7, 0.8);
  color: white;
  margin-left: 8px;
  
  &:hover {
    background: rgba(255, 193, 7, 0.9);
    transform: translateY(-1px);
  }
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
`;

export const Store: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  useEffect(() => {
    loadStoreItems();
    loadPurchasedItems();
  }, []);

  const loadStoreItems = async () => {
    try {
      const storeItems = await storeAPI.getItems();
      setItems(storeItems);
    } catch (error) {
      console.error('Failed to load store items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchasedItems = async () => {
    try {
      const purchased = await storeAPI.getPurchases();
      setPurchasedItems(purchased.map(item => item.id.toString()));
    } catch (error) {
      console.error('Failed to load purchased items:', error);
    }
  };

  const handlePurchase = async (itemId: string) => {
    try {
      const response = await storeAPI.purchaseItem(parseInt(itemId));
      setPurchasedItems([...purchasedItems, itemId]);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const handleEquip = async (itemId: string, itemType: string) => {
    // Update user's equipped items for the 3-slot system
    if (user) {
      const updatedUser = { ...user };
      const item = items.find(i => i.id.toString() === itemId);
      if (item) {
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
    }
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

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

  if (loading) {
    return (
      <StoreContainer>
        <GlassCard>
          <LoadingMessage>Loading store items...</LoadingMessage>
        </GlassCard>
      </StoreContainer>
    );
  }

  return (
    <StoreContainer>
      {/* Store Header */}
      <GlassCard>
        <StoreTitle>Crankerz Store</StoreTitle>
        <StoreSubtitle>Customize your experience with skins, badges, and more!</StoreSubtitle>
        
        <UserStats>
          <GlassCard padding="0">
            <StatItem>
              <StatNumber>{user?.level || 1}</StatNumber>
              <StatLabel>Level</StatLabel>
            </StatItem>
          </GlassCard>
          <GlassCard padding="0">
            <StatItem>
              <StatNumber>{user?.experience || 0}</StatNumber>
              <StatLabel>XP</StatLabel>
            </StatItem>
          </GlassCard>
          <GlassCard padding="0">
            <StatItem>
              <StatNumber>{user?.total_sessions || 0}</StatNumber>
              <StatLabel>Sessions</StatLabel>
            </StatItem>
          </GlassCard>
        </UserStats>
      </GlassCard>

      {/* Category Tabs */}
      <GlassCard padding="16px">
        <TabsContainer>
          <Tab 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            All Items
          </Tab>
          <Tab 
            active={activeTab === 'skin'} 
            onClick={() => setActiveTab('skin')}
          >
            Themes
          </Tab>
          <Tab 
            active={activeTab === 'badge'} 
            onClick={() => setActiveTab('badge')}
          >
            Badges
          </Tab>
          <Tab 
            active={activeTab === 'avatar'} 
            onClick={() => setActiveTab('avatar')}
          >
            Avatars
          </Tab>
        </TabsContainer>
      </GlassCard>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <ItemsGrid>
          {filteredItems.map((item) => (
            <GlassCard key={item.id} padding="0">
              <ItemCard equipped={isItemEquipped(item)}>
                <ItemImage type={item.type}>
                  🎨
                </ItemImage>
                <ItemContent>
                  <div>
                    <ItemName>{item.name}</ItemName>
                    <ItemDescription>{item.description}</ItemDescription>
                  </div>
                  <ItemFooter>
                    <ItemPrice>
                      {item.price === 0 ? 'FREE' : `${item.price} XP`}
                    </ItemPrice>
                                         {purchasedItems.includes(item.id.toString()) ? (
                       <div style={{ display: 'flex', gap: '8px' }}>
                         <PurchaseButton purchased>Owned</PurchaseButton>
                         {!isItemEquipped(item) && (
                           <EquipButton onClick={() => handleEquip(item.id.toString(), item.type)}>
                             Equip
                           </EquipButton>
                         )}
                       </div>
                     ) : (
                       <PurchaseButton onClick={() => handlePurchase(item.id.toString())}>
                         Get Item
                       </PurchaseButton>
                     )}
                  </ItemFooter>
                </ItemContent>
              </ItemCard>
            </GlassCard>
          ))}
        </ItemsGrid>
      ) : (
        <GlassCard>
          <EmptyMessage>No items found in this category.</EmptyMessage>
        </GlassCard>
      )}
    </StoreContainer>
  );
};