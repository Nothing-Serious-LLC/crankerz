// Mock API service for GitHub Pages deployment (client-side only)
import { AuthResponse, User, LeaderboardEntry, StoreItem, SessionResponse, Achievement, AchievementsResponse, Analytics, SocialReactions } from '../types';

// Utility functions for localStorage
const getStorageItem = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Mock data initialization
const initializeMockData = () => {
  if (!getStorageItem('faptracker_initialized')) {
    // Initialize default store items
    const defaultStoreItems: StoreItem[] = [
      { id: 1, name: 'Fire Theme', type: 'skin', price: 100, description: 'Hot red and orange theme', image_url: '/skins/fire.jpg', level_required: 1, created_at: new Date().toISOString() },
      { id: 2, name: 'Ocean Theme', type: 'skin', price: 150, description: 'Cool blue ocean vibes', image_url: '/skins/ocean.jpg', level_required: 3, created_at: new Date().toISOString() },
      { id: 3, name: '🔥 Hot Streak', type: 'badge', price: 50, description: 'For the dedicated', image_url: '/badges/hot.png', level_required: 1, created_at: new Date().toISOString() },
      { id: 4, name: '👑 King', type: 'badge', price: 300, description: 'Royal status', image_url: '/badges/king.png', level_required: 15, created_at: new Date().toISOString() },
      { id: 5, name: 'Golden Border', type: 'avatar', price: 200, description: 'Luxurious golden profile border', image_url: '/avatars/golden.png', level_required: 12, created_at: new Date().toISOString() },
    ];

    // Initialize achievements
    const defaultAchievements: Achievement[] = [
      { id: 1, name: 'First Timer', description: 'Complete your first session', badge_emoji: '🥇', category: 'milestones', requirement_type: 'sessions', requirement_value: 1, experience_reward: 10, created_at: new Date().toISOString() },
      { id: 2, name: 'Getting Started', description: 'Complete 5 sessions', badge_emoji: '🌟', category: 'milestones', requirement_type: 'sessions', requirement_value: 5, experience_reward: 25, created_at: new Date().toISOString() },
      { id: 3, name: 'Streak Starter', description: 'Achieve a 3-day streak', badge_emoji: '🔥', category: 'consistency', requirement_type: 'streak', requirement_value: 3, experience_reward: 20, created_at: new Date().toISOString() },
      { id: 4, name: 'Social Butterfly', description: 'Add your first friend', badge_emoji: '🦋', category: 'social', requirement_type: 'friends', requirement_value: 1, experience_reward: 15, created_at: new Date().toISOString() },
    ];

    setStorageItem('faptracker_store_items', defaultStoreItems);
    setStorageItem('faptracker_achievements', defaultAchievements);
    setStorageItem('faptracker_users', []);
    setStorageItem('faptracker_sessions', []);
    setStorageItem('faptracker_initialized', true);
  }
};

// Helper functions
const calculateLevel = (experience: number) => Math.floor(Math.sqrt(experience / 100)) + 1;

const getExperienceForNextLevel = (currentLevel: number) => Math.pow(currentLevel, 2) * 100;

const generateId = () => Date.now() + Math.random();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Auth API
export const mockAuthAPI = {
  register: async (username: string, password: string, country: string): Promise<AuthResponse> => {
    await delay(500); // Simulate network delay
    
    const users = getStorageItem('faptracker_users', []);
    
    if (users.find((u: User) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      id: generateId(),
      username: username.toLowerCase(),
      country,
      total_sessions: 0,
      current_streak: 0,
      longest_streak: 0,
      created_at: new Date().toISOString(),
      active_skin: 'default',
      badges: '[]',
      level: 1,
      experience: 0,
      unlocked_achievements: '[]'
    };

    users.push(newUser);
    setStorageItem('faptracker_users', users);
    setStorageItem('faptracker_current_user', newUser);

    return {
      token: 'mock-jwt-token-' + newUser.id,
      user: newUser
    };
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    await delay(500);
    
    const users = getStorageItem('faptracker_users', []);
    const user = users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    setStorageItem('faptracker_current_user', user);

    return {
      token: 'mock-jwt-token-' + user.id,
      user
    };
  },
};

// Mock User API
export const mockUserAPI = {
  getProfile: async (): Promise<User> => {
    await delay(200);
    
    const user = getStorageItem('faptracker_current_user');
    if (!user) throw new Error('User not found');

    // Add level progression info
    const nextLevelExp = getExperienceForNextLevel(user.level);
    const currentLevelExp = user.level > 1 ? getExperienceForNextLevel(user.level - 1) : 0;
    const progressToNext = user.experience - currentLevelExp;
    const expNeededForNext = nextLevelExp - currentLevelExp;
    
    user.levelProgress = {
      current: Math.max(0, progressToNext),
      needed: expNeededForNext,
      percentage: Math.min(100, Math.max(0, Math.round((progressToNext / expNeededForNext) * 100)))
    };

    return user;
  },
};

// Mock Session API
export const mockSessionAPI = {
  addSession: async (notes?: string): Promise<SessionResponse> => {
    await delay(300);
    
    const user = getStorageItem('faptracker_current_user');
    if (!user) throw new Error('User not found');

    const sessions = getStorageItem('faptracker_sessions', []);
    const newSession = {
      id: generateId(),
      user_id: user.id,
      timestamp: new Date().toISOString(),
      notes: notes || '',
      day_of_week: new Date().getDay(),
      hour_of_day: new Date().getHours()
    };

    sessions.push(newSession);
    setStorageItem('faptracker_sessions', sessions);

    // Update user stats
    user.total_sessions += 1;
    user.experience += 10;
    user.level = calculateLevel(user.experience);
    user.last_session = new Date().toISOString();

    // Update current streak (simplified)
    const today = new Date().toDateString();
    const userSessions = sessions.filter((s: any) => s.user_id === user.id);
    const recentSessions = userSessions.filter((s: any) => {
      const sessionDate = new Date(s.timestamp).toDateString();
      const daysDiff = Math.floor((Date.now() - new Date(s.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    
    user.current_streak = Math.min(recentSessions.length, 7);
    user.longest_streak = Math.max(user.longest_streak, user.current_streak);

    const users = getStorageItem('faptracker_users', []);
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      setStorageItem('faptracker_users', users);
    }
    setStorageItem('faptracker_current_user', user);

    return {
      id: newSession.id,
      message: 'Session recorded successfully! +10 XP'
    };
  },
};

// Mock Analytics API
export const mockAnalyticsAPI = {
  getUserAnalytics: async (): Promise<Analytics> => {
    await delay(400);
    
    const user = getStorageItem('faptracker_current_user');
    if (!user) throw new Error('User not found');

    const sessions = getStorageItem('faptracker_sessions', [])
      .filter((s: any) => s.user_id === user.id);

    const dayCounts = new Array(7).fill(0);
    const hourCounts = new Array(24).fill(0);
    
    sessions.forEach((session: any) => {
      dayCounts[session.day_of_week] += 1;
      hourCounts[session.hour_of_day] += 1;
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const bestHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Generate mock monthly trends
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      monthlyTrends.push({
        month: date.toISOString().slice(0, 7),
        sessions: Math.floor(Math.random() * 20) + 5
      });
    }

    const joinDate = new Date(user.created_at);
    const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
    const consistencyScore = Math.min(100, Math.round((user.total_sessions / daysSinceJoin) * 100));

    return {
      basicStats: {
        total_sessions: user.total_sessions,
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
        level: user.level,
        experience: user.experience,
        join_date: user.created_at
      },
      patterns: {
        bestDay: dayNames[bestDayIndex],
        bestHour,
        dayCounts,
        hourCounts
      },
      monthlyTrends,
      consistencyScore
    };
  },
};

// Mock Achievement API
export const mockAchievementAPI = {
  getAchievements: async (): Promise<AchievementsResponse> => {
    await delay(300);
    
    const user = getStorageItem('faptracker_current_user');
    const allAchievements = getStorageItem('faptracker_achievements', []);
    const unlockedIds = JSON.parse(user?.unlocked_achievements || '[]');
    
    const unlocked = allAchievements.filter((a: Achievement) => unlockedIds.includes(a.id));
    const available = allAchievements.filter((a: Achievement) => !unlockedIds.includes(a.id));

    return {
      unlocked,
      available,
      totalUnlocked: unlocked.length,
      totalAvailable: allAchievements.length
    };
  },
};

// Mock Reactions API
export const mockReactionsAPI = {
  addReaction: async (targetUserId: number, targetType: string, targetId: number, reactionType: string): Promise<{ message: string }> => {
    await delay(200);
    return { message: 'Reaction added!' };
  },

  getReactions: async (targetType: string, targetId: number): Promise<SocialReactions> => {
    await delay(200);
    return {};
  },
};

// Mock Leaderboard API
export const mockLeaderboardAPI = {
  getGlobal: async (): Promise<LeaderboardEntry[]> => {
    await delay(400);
    
    const users = getStorageItem('faptracker_users', []);
    return users
      .sort((a: User, b: User) => b.total_sessions - a.total_sessions)
      .slice(0, 10)
      .map((user: User) => ({
        username: user.username,
        total_sessions: user.total_sessions,
        badges: user.badges,
        country: user.country,
        level: user.level
      }));
  },

  getCountry: async (country: string): Promise<LeaderboardEntry[]> => {
    await delay(400);
    
    const users = getStorageItem('faptracker_users', []);
    return users
      .filter((user: User) => user.country === country)
      .sort((a: User, b: User) => b.total_sessions - a.total_sessions)
      .slice(0, 10)
      .map((user: User) => ({
        username: user.username,
        total_sessions: user.total_sessions,
        badges: user.badges,
        country: user.country,
        level: user.level
      }));
  },

  getFriends: async (): Promise<LeaderboardEntry[]> => {
    await delay(400);
    // Mock friends leaderboard
    return [];
  },
};

// Mock Store API
export const mockStoreAPI = {
  getItems: async (): Promise<StoreItem[]> => {
    await delay(300);
    
    const user = getStorageItem('faptracker_current_user');
    const items = getStorageItem('faptracker_store_items', []);
    
    return items.map((item: StoreItem) => ({
      ...item,
      available: user.level >= item.level_required,
      levelRequired: item.level_required
    }));
  },

  getPurchases: async (): Promise<StoreItem[]> => {
    await delay(200);
    
    const user = getStorageItem('faptracker_current_user');
    const purchases = getStorageItem(`faptracker_purchases_${user.id}`, []);
    const items = getStorageItem('faptracker_store_items', []);
    
    return items.filter((item: StoreItem) => purchases.includes(item.id));
  },

  purchaseItem: async (itemId: number): Promise<{ message: string }> => {
    await delay(300);
    
    const user = getStorageItem('faptracker_current_user');
    const items = getStorageItem('faptracker_store_items', []);
    const item = items.find((i: StoreItem) => i.id === itemId);
    
    if (!item) throw new Error('Item not found');
    if (user.level < item.level_required) throw new Error(`Level ${item.level_required} required`);
    if (user.total_sessions < item.price) throw new Error('Insufficient points');
    
    const purchases = getStorageItem(`faptracker_purchases_${user.id}`, []);
    if (purchases.includes(itemId)) throw new Error('Item already owned');
    
    purchases.push(itemId);
    setStorageItem(`faptracker_purchases_${user.id}`, purchases);
    
    return { message: 'Item purchased successfully!' };
  },
};

// Mock Friends API
export const mockFriendsAPI = {
  addFriend: async (username: string): Promise<{ message: string }> => {
    await delay(300);
    return { message: 'Friend request sent!' };
  },
};

// Initialize mock data
initializeMockData();