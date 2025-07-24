export interface User {
  id: number;
  username: string;
  country: string;
  total_sessions: number;
  current_streak: number;
  longest_streak: number;
  last_session?: string;
  created_at: string;
  active_skin: string;
  badges: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LeaderboardEntry {
  username: string;
  total_sessions: number;
  badges: string;
  country: string;
}

export interface StoreItem {
  id: number;
  name: string;
  type: 'skin' | 'badge';
  price: number;
  description: string;
  image_url: string;
  created_at: string;
}

export interface SessionResponse {
  id: number;
  message: string;
}