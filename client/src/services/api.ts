import { AuthResponse, User, LeaderboardEntry, StoreItem, SessionResponse, Achievement, AchievementsResponse, Analytics, SocialReactions } from '../types';

// Import mock APIs for GitHub Pages deployment
import {
  mockAuthAPI,
  mockUserAPI,
  mockSessionAPI,
  mockAnalyticsAPI,
  mockAchievementAPI,
  mockReactionsAPI,
  mockLeaderboardAPI,
  mockStoreAPI,
  mockFriendsAPI
} from './mockApi';

// For GitHub Pages static deployment, always use mock API
const USE_MOCK_API = true;

// Auth API
export const authAPI = {
  register: async (username: string, password: string, country: string): Promise<AuthResponse> => {
    return mockAuthAPI.register(username, password, country);
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    return mockAuthAPI.login(username, password);
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<User> => {
    return mockUserAPI.getProfile();
  },

  updateEquipment: async (equipment: {
    equipped_theme?: string;
    equipped_badge?: string;
    equipped_avatar_frame?: string;
  }): Promise<User> => {
    return mockUserAPI.updateEquipment(equipment);
  },
};

// Session API
export const sessionAPI = {
  addSession: async (notes?: string): Promise<SessionResponse> => {
    return mockSessionAPI.addSession(notes);
  },
};

// Analytics API
export const analyticsAPI = {
  getUserAnalytics: async (): Promise<Analytics> => {
    return mockAnalyticsAPI.getUserAnalytics();
  },
};

// Achievement API
export const achievementAPI = {
  getAchievements: async (): Promise<AchievementsResponse> => {
    return mockAchievementAPI.getAchievements();
  },
};

// Social Reactions API
export const reactionsAPI = {
  addReaction: async (targetUserId: number, targetType: string, targetId: number, reactionType: string): Promise<{ message: string }> => {
    return mockReactionsAPI.addReaction(targetUserId, targetType, targetId, reactionType);
  },

  getReactions: async (targetType: string, targetId: number): Promise<SocialReactions> => {
    return mockReactionsAPI.getReactions(targetType, targetId);
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: async (): Promise<LeaderboardEntry[]> => {
    return mockLeaderboardAPI.getGlobal();
  },

  getCountry: async (country: string): Promise<LeaderboardEntry[]> => {
    return mockLeaderboardAPI.getCountry(country);
  },

  getFriends: async (): Promise<LeaderboardEntry[]> => {
    return mockLeaderboardAPI.getFriends();
  },
};

// Store API
export const storeAPI = {
  getItems: async (): Promise<StoreItem[]> => {
    return mockStoreAPI.getItems();
  },

  getPurchases: async (): Promise<StoreItem[]> => {
    return mockStoreAPI.getPurchases();
  },

  purchaseItem: async (itemId: number): Promise<{ message: string }> => {
    return mockStoreAPI.purchaseItem(itemId);
  },
};

// Friends API
export const friendsAPI = {
  addFriend: async (username: string): Promise<{ message: string }> => {
    return mockFriendsAPI.addFriend(username);
  },
};