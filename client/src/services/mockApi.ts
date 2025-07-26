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
  if (!getStorageItem('crankerz_initialized')) {
    // Initialize 3-slot equipment store items
    const defaultStoreItems: StoreItem[] = [
      // === THEMES (affect check-in button and overall UI theming) ===
      { id: 1, name: 'Fire Theme', type: 'theme', price: 100, description: 'Hot red and orange check-in button theme', image_url: '/themes/fire.jpg', level_required: 1, created_at: new Date().toISOString() },
      { id: 2, name: 'Ocean Theme', type: 'theme', price: 150, description: 'Cool blue ocean check-in vibes', image_url: '/themes/ocean.jpg', level_required: 3, created_at: new Date().toISOString() },
      { id: 3, name: 'Dark Mode Pro', type: 'theme', price: 200, description: 'Sleek dark professional check-in theme', image_url: '/themes/dark.jpg', level_required: 5, created_at: new Date().toISOString() },
      { id: 4, name: 'Neon Glow', type: 'theme', price: 250, description: 'Cyberpunk neon check-in aesthetics', image_url: '/themes/neon.jpg', level_required: 8, created_at: new Date().toISOString() },
      { id: 5, name: 'Forest Theme', type: 'theme', price: 175, description: 'Natural green forest check-in vibes', image_url: '/themes/forest.jpg', level_required: 4, created_at: new Date().toISOString() },
      { id: 6, name: 'Sunset Glow', type: 'theme', price: 300, description: 'Warm orange-pink sunset check-in theme', image_url: '/themes/sunset.jpg', level_required: 10, created_at: new Date().toISOString() },
      { id: 7, name: 'Ice Crystal', type: 'theme', price: 225, description: 'Cool ice blue crystalline check-in theme', image_url: '/themes/ice.jpg', level_required: 6, created_at: new Date().toISOString() },
      { id: 8, name: 'Cosmic Purple', type: 'theme', price: 400, description: 'Deep space purple nebula check-in theme', image_url: '/themes/cosmic.jpg', level_required: 15, created_at: new Date().toISOString() },
      { id: 9, name: 'Cherry Blossom', type: 'theme', price: 350, description: 'Soft pink sakura check-in theme', image_url: '/themes/cherry.jpg', level_required: 12, created_at: new Date().toISOString() },
      { id: 10, name: 'Midnight Black', type: 'theme', price: 500, description: 'Ultimate black premium check-in theme', image_url: '/themes/midnight.jpg', level_required: 20, created_at: new Date().toISOString() },

      // === BADGES ===
      { id: 11, name: '🔥 Hot Streak', type: 'badge', price: 50, description: 'For the dedicated crankers', image_url: '/badges/hot.png', level_required: 1, created_at: new Date().toISOString() },
      { id: 12, name: '👑 King', type: 'badge', price: 300, description: 'Royal status symbol', image_url: '/badges/king.png', level_required: 15, created_at: new Date().toISOString() },
      { id: 13, name: '💎 Diamond', type: 'badge', price: 150, description: 'Precious and rare', image_url: '/badges/diamond.png', level_required: 8, created_at: new Date().toISOString() },
      { id: 14, name: '🚀 Rocket', type: 'badge', price: 100, description: 'Sky high performer', image_url: '/badges/rocket.png', level_required: 5, created_at: new Date().toISOString() },
      { id: 15, name: '⚡ Lightning', type: 'badge', price: 75, description: 'Quick and electric', image_url: '/badges/lightning.png', level_required: 3, created_at: new Date().toISOString() },
      { id: 16, name: '🎯 Target', type: 'badge', price: 125, description: 'Always on target', image_url: '/badges/target.png', level_required: 6, created_at: new Date().toISOString() },
      { id: 17, name: '🏆 Champion', type: 'badge', price: 400, description: 'Ultimate winner badge', image_url: '/badges/champion.png', level_required: 18, created_at: new Date().toISOString() },
      { id: 18, name: '🌟 Superstar', type: 'badge', price: 200, description: 'Shining bright star', image_url: '/badges/star.png', level_required: 10, created_at: new Date().toISOString() },
      { id: 19, name: '🎪 Circus Master', type: 'badge', price: 175, description: 'Master of entertainment', image_url: '/badges/circus.png', level_required: 9, created_at: new Date().toISOString() },
      { id: 20, name: '🔮 Mystic', type: 'badge', price: 250, description: 'Mysterious and magical', image_url: '/badges/mystic.png', level_required: 12, created_at: new Date().toISOString() },
      
      // === ADDITIONAL BADGES ===
      { id: 41, name: '🎮 Gamer', type: 'badge', price: 120, description: 'For the gaming enthusiasts', image_url: '/badges/gamer.png', level_required: 6, created_at: new Date().toISOString() },
      { id: 42, name: '🌙 Night Owl', type: 'badge', price: 90, description: 'Late night session master', image_url: '/badges/nightowl.png', level_required: 4, created_at: new Date().toISOString() },
      { id: 43, name: '🔋 Energizer', type: 'badge', price: 160, description: 'Always charged and ready', image_url: '/badges/energy.png', level_required: 8, created_at: new Date().toISOString() },
      { id: 44, name: '🎨 Artist', type: 'badge', price: 140, description: 'Creative and colorful spirit', image_url: '/badges/artist.png', level_required: 7, created_at: new Date().toISOString() },
      { id: 45, name: '🏴‍☠️ Rebel', type: 'badge', price: 200, description: 'Rules are meant to be broken', image_url: '/badges/rebel.png', level_required: 10, created_at: new Date().toISOString() },

      // === AVATAR FRAMES (affect the border around your badge/avatar) ===
      { id: 21, name: 'Golden Border', type: 'avatar_frame', price: 200, description: 'Luxurious golden profile border', image_url: '/avatars/golden.png', level_required: 12, created_at: new Date().toISOString() },
      { id: 22, name: 'Silver Frame', type: 'avatar_frame', price: 150, description: 'Elegant silver frame', image_url: '/avatars/silver.png', level_required: 8, created_at: new Date().toISOString() },
      { id: 23, name: 'Bronze Ring', type: 'avatar_frame', price: 100, description: 'Classic bronze border', image_url: '/avatars/bronze.png', level_required: 5, created_at: new Date().toISOString() },
      { id: 24, name: 'Neon Outline', type: 'avatar_frame', price: 250, description: 'Glowing neon border effect', image_url: '/avatars/neon.png', level_required: 10, created_at: new Date().toISOString() },
      { id: 25, name: 'Fire Ring', type: 'avatar_frame', price: 175, description: 'Burning flame border', image_url: '/avatars/fire.png', level_required: 7, created_at: new Date().toISOString() },
      { id: 26, name: 'Ice Crown', type: 'avatar_frame', price: 300, description: 'Frozen crystal crown frame', image_url: '/avatars/ice.png', level_required: 14, created_at: new Date().toISOString() },
      { id: 27, name: 'Rainbow Arc', type: 'avatar_frame', price: 225, description: 'Colorful rainbow border', image_url: '/avatars/rainbow.png', level_required: 11, created_at: new Date().toISOString() },
      { id: 28, name: 'Dragon Scale', type: 'avatar_frame', price: 400, description: 'Mythical dragon scale frame', image_url: '/avatars/dragon.png', level_required: 16, created_at: new Date().toISOString() },
      { id: 29, name: 'Space Halo', type: 'avatar_frame', price: 350, description: 'Cosmic space ring', image_url: '/avatars/space.png', level_required: 15, created_at: new Date().toISOString() },
      { id: 30, name: 'Diamond Crust', type: 'avatar_frame', price: 500, description: 'Ultra premium diamond frame', image_url: '/avatars/diamond.png', level_required: 20, created_at: new Date().toISOString() },

      // === SPECIAL THEMES ===
      { id: 31, name: 'Retro Wave', type: 'theme', price: 300, description: '80s synthwave aesthetic', image_url: '/themes/retro.jpg', level_required: 13, created_at: new Date().toISOString() },
      { id: 32, name: 'Minimalist White', type: 'theme', price: 250, description: 'Clean minimal design', image_url: '/themes/minimal.jpg', level_required: 11, created_at: new Date().toISOString() },
      { id: 33, name: 'Gaming RGB', type: 'theme', price: 275, description: 'RGB gaming setup vibes', image_url: '/themes/gaming.jpg', level_required: 12, created_at: new Date().toISOString() },
      { id: 34, name: 'Coffee Shop', type: 'theme', price: 200, description: 'Warm coffee house atmosphere', image_url: '/themes/coffee.jpg', level_required: 9, created_at: new Date().toISOString() },
      { id: 35, name: 'Beach Sunset', type: 'theme', price: 225, description: 'Tropical beach sunset', image_url: '/themes/beach.jpg', level_required: 10, created_at: new Date().toISOString() },
    ];

    // Initialize achievements
    const defaultAchievements: Achievement[] = [
      { id: 1, name: 'First Timer', description: 'Complete your first session', badge_emoji: '🥇', category: 'milestones', requirement_type: 'sessions', requirement_value: 1, experience_reward: 10, created_at: new Date().toISOString() },
      { id: 2, name: 'Getting Started', description: 'Complete 5 sessions', badge_emoji: '🌟', category: 'milestones', requirement_type: 'sessions', requirement_value: 5, experience_reward: 25, created_at: new Date().toISOString() },
      { id: 3, name: 'Streak Starter', description: 'Achieve a 3-day streak', badge_emoji: '🔥', category: 'consistency', requirement_type: 'streak', requirement_value: 3, experience_reward: 20, created_at: new Date().toISOString() },
      { id: 4, name: 'Social Butterfly', description: 'Add your first friend', badge_emoji: '🦋', category: 'social', requirement_type: 'friends', requirement_value: 1, experience_reward: 15, created_at: new Date().toISOString() },
      { id: 5, name: 'Store Explorer', description: 'Purchase your first item', badge_emoji: '🛒', category: 'milestones', requirement_type: 'sessions', requirement_value: 10, experience_reward: 15, created_at: new Date().toISOString() },
      { id: 6, name: 'Fashion Icon', description: 'Own 5 different items', badge_emoji: '👗', category: 'social', requirement_type: 'sessions', requirement_value: 25, experience_reward: 30, created_at: new Date().toISOString() },
      { id: 7, name: 'Level Master', description: 'Reach level 10', badge_emoji: '🎯', category: 'milestones', requirement_type: 'sessions', requirement_value: 50, experience_reward: 50, created_at: new Date().toISOString() },
      { id: 8, name: 'Consistency King', description: 'Maintain a 7-day streak', badge_emoji: '🏅', category: 'consistency', requirement_type: 'streak', requirement_value: 7, experience_reward: 40, created_at: new Date().toISOString() },
    ];

    setStorageItem('crankerz_store_items', defaultStoreItems);
    setStorageItem('crankerz_achievements', defaultAchievements);
    setStorageItem('crankerz_users', []);
    setStorageItem('crankerz_sessions', []);
    setStorageItem('crankerz_initialized', true);
  }
};

// Special function to give "Absurd Crankers" account all items for testing
const giveAllItemsToTestAccount = (user: User) => {
  if (user.username.toLowerCase() === 'absurd crankers' || user.username.toLowerCase() === 'absurdcrankers') {
    const allItems = getStorageItem('crankerz_store_items', []);
    const allItemIds = allItems.map((item: StoreItem) => item.id);
    setStorageItem(`crankerz_purchases_${user.id}`, allItemIds);
    
    // Also give them some premium badges
    const premiumBadges = ['🔥', '👑', '💎', '🚀', '⚡', '🎯', '🏆', '🌟', '🎪', '🔮'];
    user.badges = JSON.stringify(premiumBadges);
    
    // Set high level and experience for testing
    user.level = 25;
    user.experience = 6250; // 25^2 * 10
    user.total_sessions = 500; // Lots of points to spend
    
    setStorageItem('crankerz_current_user', user);
    
    // Update user in users array
    const users = getStorageItem('crankerz_users', []);
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      setStorageItem('crankerz_users', users);
    }
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
    
    const users = getStorageItem('crankerz_users', []);
    
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
    setStorageItem('crankerz_users', users);
    setStorageItem('crankerz_current_user', newUser);

    // Give special test account all items
    giveAllItemsToTestAccount(newUser);

    return {
      token: 'mock-jwt-token-' + newUser.id,
      user: getStorageItem('crankerz_current_user') // Get updated user
    };
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    await delay(500);
    
    const users = getStorageItem('crankerz_users', []);
    const user = users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    setStorageItem('crankerz_current_user', user);

    // Give special test account all items
    giveAllItemsToTestAccount(user);

    return {
      token: 'mock-jwt-token-' + user.id,
      user: getStorageItem('crankerz_current_user') // Get updated user
    };
  },
};

// Mock User API
export const mockUserAPI = {
  getProfile: async (): Promise<User> => {
    await delay(200);
    
    const user = getStorageItem('crankerz_current_user');
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

  updateEquipment: async (equipment: {
    equipped_theme?: string;
    equipped_badge?: string;
    equipped_avatar_frame?: string;
  }): Promise<User> => {
    await delay(150);
    const user = getStorageItem('crankerz_current_user');
    if (!user) throw new Error('User not found');
    if (equipment.equipped_theme !== undefined) user.equipped_theme = equipment.equipped_theme;
    if (equipment.equipped_badge !== undefined) user.equipped_badge = equipment.equipped_badge;
    if (equipment.equipped_avatar_frame !== undefined) user.equipped_avatar_frame = equipment.equipped_avatar_frame;

    // Persist to storage
    setStorageItem('crankerz_current_user', user);
    const users = getStorageItem('crankerz_users', []);
    const idx = users.findIndex((u: User) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      setStorageItem('crankerz_users', users);
    }

    return user;
  },
};

// Mock Session API
export const mockSessionAPI = {
  addSession: async (notes?: string): Promise<SessionResponse> => {
    await delay(300);
    
    const user = getStorageItem('crankerz_current_user');
    if (!user) throw new Error('User not found');

    const sessions = getStorageItem('crankerz_sessions', []);
    const newSession = {
      id: generateId(),
      user_id: user.id,
      timestamp: new Date().toISOString(),
      notes: notes || '',
      day_of_week: new Date().getDay(),
      hour_of_day: new Date().getHours()
    };

    sessions.push(newSession);
    setStorageItem('crankerz_sessions', sessions);

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

    const users = getStorageItem('crankerz_users', []);
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      setStorageItem('crankerz_users', users);
    }
    setStorageItem('crankerz_current_user', user);

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
    
    const user = getStorageItem('crankerz_current_user');
    if (!user) throw new Error('User not found');

    const sessions = getStorageItem('crankerz_sessions', [])
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
    
    const user = getStorageItem('crankerz_current_user');
    const allAchievements = getStorageItem('crankerz_achievements', []);
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
    
    const users = getStorageItem('crankerz_users', []);
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
    
    const users = getStorageItem('crankerz_users', []);
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

    // Ensure store items exist, if not re initialize
    let items: StoreItem[] = getStorageItem('crankerz_store_items', []);

    // If items array is empty or somehow corrupted, force reinitialization
    if (!Array.isArray(items) || items.length === 0) {
      // Re-seed mock data and fetch again
      setStorageItem('crankerz_initialized', false);
      initializeMockData();
      items = getStorageItem('crankerz_store_items', []);
    }

    // All items are free and available to everyone in mock mode
    return items.map((item: StoreItem) => ({
      ...item,
      price: 0,
      available: true,
      levelRequired: 0,
    }));
  },

  getPurchases: async (): Promise<StoreItem[]> => {
    await delay(200);
    
    const user = getStorageItem('crankerz_current_user');
    const purchases = getStorageItem(`crankerz_purchases_${user.id}`, []);
    const items = getStorageItem('crankerz_store_items', []);
    
    return items.filter((item: StoreItem) => purchases.includes(item.id));
  },

  purchaseItem: async (itemId: number): Promise<{ message: string }> => {
    await delay(100);
    const user = getStorageItem('crankerz_current_user');
    const purchases = getStorageItem(`crankerz_purchases_${user.id}`, []);
    if (!purchases.includes(itemId)) {
      purchases.push(itemId);
      setStorageItem(`crankerz_purchases_${user.id}`, purchases);
    }
    return { message: 'Item added!' };
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