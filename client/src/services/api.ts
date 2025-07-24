import axios from 'axios';
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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const USE_MOCK_API = process.env.REACT_APP_ENV === 'production' && window.location.hostname === 'crankerz.com';

// Create axios instance for real API calls
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !USE_MOCK_API) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (username: string, password: string, country: string): Promise<AuthResponse> => {
    if (USE_MOCK_API) {
      return mockAuthAPI.register(username, password, country);
    }
    
    const response = await api.post('/auth/register', { username, password, country });
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    if (USE_MOCK_API) {
      return mockAuthAPI.login(username, password);
    }
    
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<User> => {
    if (USE_MOCK_API) {
      return mockUserAPI.getProfile();
    }
    
    const response = await api.get('/user/profile');
    return response.data;
  },
};

// Session API
export const sessionAPI = {
  addSession: async (notes?: string): Promise<SessionResponse> => {
    if (USE_MOCK_API) {
      return mockSessionAPI.addSession(notes);
    }
    
    const response = await api.post('/sessions', { notes });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getUserAnalytics: async (): Promise<Analytics> => {
    if (USE_MOCK_API) {
      return mockAnalyticsAPI.getUserAnalytics();
    }
    
    const response = await api.get('/analytics');
    return response.data;
  },
};

// Achievement API
export const achievementAPI = {
  getAchievements: async (): Promise<AchievementsResponse> => {
    if (USE_MOCK_API) {
      return mockAchievementAPI.getAchievements();
    }
    
    const response = await api.get('/achievements');
    return response.data;
  },
};

// Social Reactions API
export const reactionsAPI = {
  addReaction: async (targetUserId: number, targetType: string, targetId: number, reactionType: string): Promise<{ message: string }> => {
    if (USE_MOCK_API) {
      return mockReactionsAPI.addReaction(targetUserId, targetType, targetId, reactionType);
    }
    
    const response = await api.post('/reactions', { targetUserId, targetType, targetId, reactionType });
    return response.data;
  },

  getReactions: async (targetType: string, targetId: number): Promise<SocialReactions> => {
    if (USE_MOCK_API) {
      return mockReactionsAPI.getReactions(targetType, targetId);
    }
    
    const response = await api.get(`/reactions/${targetType}/${targetId}`);
    return response.data;
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: async (): Promise<LeaderboardEntry[]> => {
    if (USE_MOCK_API) {
      return mockLeaderboardAPI.getGlobal();
    }
    
    const response = await api.get('/leaderboard/global');
    return response.data;
  },

  getCountry: async (country: string): Promise<LeaderboardEntry[]> => {
    if (USE_MOCK_API) {
      return mockLeaderboardAPI.getCountry(country);
    }
    
    const response = await api.get(`/leaderboard/country/${country}`);
    return response.data;
  },

  getFriends: async (): Promise<LeaderboardEntry[]> => {
    if (USE_MOCK_API) {
      return mockLeaderboardAPI.getFriends();
    }
    
    const response = await api.get('/leaderboard/friends');
    return response.data;
  },
};

// Store API
export const storeAPI = {
  getItems: async (): Promise<StoreItem[]> => {
    if (USE_MOCK_API) {
      return mockStoreAPI.getItems();
    }
    
    const response = await api.get('/store/items');
    return response.data;
  },

  getPurchases: async (): Promise<StoreItem[]> => {
    if (USE_MOCK_API) {
      return mockStoreAPI.getPurchases();
    }
    
    const response = await api.get('/store/purchases');
    return response.data;
  },

  purchaseItem: async (itemId: number): Promise<{ message: string }> => {
    if (USE_MOCK_API) {
      return mockStoreAPI.purchaseItem(itemId);
    }
    
    const response = await api.post('/store/purchase', { itemId });
    return response.data;
  },
};

// Friends API
export const friendsAPI = {
  addFriend: async (username: string): Promise<{ message: string }> => {
    if (USE_MOCK_API) {
      return mockFriendsAPI.addFriend(username);
    }
    
    const response = await api.post('/friends/add', { username });
    return response.data;
  },
};