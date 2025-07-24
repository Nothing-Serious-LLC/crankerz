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
  level: number;
  experience: number;
  levelProgress?: {
    current: number;
    needed: number;
    percentage: number;
  };
  unlocked_achievements: string;
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
  level: number;
}

export interface StoreItem {
  id: number;
  name: string;
  type: 'skin' | 'badge' | 'avatar' | 'theme';
  price: number;
  description: string;
  image_url: string;
  level_required: number;
  available?: boolean;
  levelRequired?: number;
  created_at: string;
}

export interface SessionResponse {
  id: number;
  message: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  badge_emoji: string;
  category: 'consistency' | 'social' | 'milestones';
  requirement_type: 'sessions' | 'streak' | 'friends' | 'level';
  requirement_value: number;
  experience_reward: number;
  unlocked_at?: string;
  created_at: string;
}

export interface AchievementsResponse {
  unlocked: Achievement[];
  available: Achievement[];
  totalUnlocked: number;
  totalAvailable: number;
}

export interface Analytics {
  basicStats: {
    total_sessions: number;
    current_streak: number;
    longest_streak: number;
    level: number;
    experience: number;
    join_date: string;
  };
  patterns: {
    bestDay: string;
    bestHour: number;
    dayCounts: number[];
    hourCounts: number[];
  };
  monthlyTrends: Array<{
    month: string;
    sessions: number;
  }>;
  consistencyScore: number;
}

export interface SocialReaction {
  username: string;
  created_at: string;
}

export interface SocialReactions {
  like?: SocialReaction[];
  fire?: SocialReaction[];
  cheer?: SocialReaction[];
  wow?: SocialReaction[];
}