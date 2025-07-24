import axios from 'axios';
import { AuthResponse, User, LeaderboardEntry, StoreItem, SessionResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (username: string, password: string, country: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { username, password, country });
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/profile');
    return response.data;
  },
};

// Session API
export const sessionAPI = {
  addSession: async (notes?: string): Promise<SessionResponse> => {
    const response = await api.post('/sessions', { notes });
    return response.data;
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: async (): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/leaderboard/global');
    return response.data;
  },

  getCountry: async (country: string): Promise<LeaderboardEntry[]> => {
    const response = await api.get(`/leaderboard/country/${country}`);
    return response.data;
  },

  getFriends: async (): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/leaderboard/friends');
    return response.data;
  },
};

// Store API
export const storeAPI = {
  getItems: async (): Promise<StoreItem[]> => {
    const response = await api.get('/store/items');
    return response.data;
  },

  getPurchases: async (): Promise<StoreItem[]> => {
    const response = await api.get('/store/purchases');
    return response.data;
  },

  purchaseItem: async (itemId: number): Promise<{ message: string }> => {
    const response = await api.post('/store/purchase', { itemId });
    return response.data;
  },
};

// Friends API
export const friendsAPI = {
  addFriend: async (username: string): Promise<{ message: string }> => {
    const response = await api.post('/friends/add', { username });
    return response.data;
  },
};