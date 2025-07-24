const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.db = new sqlite3.Database('./fap_tracker.db');
    this.init();
  }

  init() {
    // Users table - updated with level system
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        country TEXT DEFAULT 'Unknown',
        total_sessions INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_session DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        active_skin TEXT DEFAULT 'default',
        badges TEXT DEFAULT '[]',
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        unlocked_achievements TEXT DEFAULT '[]'
      )
    `);

    // Sessions table (masturbation check-ins)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        day_of_week INTEGER,
        hour_of_day INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Friends table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (friend_id) REFERENCES users (id),
        UNIQUE(user_id, friend_id)
      )
    `);

    // Store items table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS store_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- 'skin', 'badge', 'avatar', 'theme'
        price INTEGER NOT NULL,
        description TEXT,
        image_url TEXT,
        level_required INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User purchases table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (item_id) REFERENCES store_items (id),
        UNIQUE(user_id, item_id)
      )
    `);

    // Achievements table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        badge_emoji TEXT NOT NULL,
        category TEXT NOT NULL, -- 'consistency', 'social', 'milestones'
        requirement_type TEXT NOT NULL, -- 'sessions', 'streak', 'friends', 'level'
        requirement_value INTEGER NOT NULL,
        experience_reward INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User achievements table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id INTEGER NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (achievement_id) REFERENCES achievements (id),
        UNIQUE(user_id, achievement_id)
      )
    `);

    // Social reactions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS social_reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        target_user_id INTEGER NOT NULL,
        target_type TEXT NOT NULL, -- 'session', 'achievement', 'streak'
        target_id INTEGER NOT NULL,
        reaction_type TEXT NOT NULL, -- 'like', 'fire', 'cheer', 'wow'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (target_user_id) REFERENCES users (id),
        UNIQUE(user_id, target_type, target_id)
      )
    `);

    // Insert default data
    this.insertDefaultStoreItems();
    this.insertDefaultAchievements();
  }

  insertDefaultStoreItems() {
    const defaultItems = [
      // Skins
      { name: 'Fire Theme', type: 'skin', price: 100, description: 'Hot red and orange theme', image_url: '/skins/fire.jpg', level_required: 1 },
      { name: 'Ocean Theme', type: 'skin', price: 150, description: 'Cool blue ocean vibes', image_url: '/skins/ocean.jpg', level_required: 3 },
      { name: 'Dark Mode Pro', type: 'skin', price: 200, description: 'Premium dark theme', image_url: '/skins/dark.jpg', level_required: 5 },
      { name: 'Neon Glow', type: 'skin', price: 250, description: 'Cyberpunk neon aesthetic', image_url: '/skins/neon.jpg', level_required: 10 },
      
      // Badges
      { name: '🔥 Hot Streak', type: 'badge', price: 50, description: 'For the dedicated', image_url: '/badges/hot.png', level_required: 1 },
      { name: '👑 King', type: 'badge', price: 300, description: 'Royal status', image_url: '/badges/king.png', level_required: 15 },
      { name: '💎 Diamond', type: 'badge', price: 500, description: 'Premium member', image_url: '/badges/diamond.png', level_required: 20 },
      { name: '🚀 Rocket', type: 'badge', price: 150, description: 'Sky high performance', image_url: '/badges/rocket.png', level_required: 8 },
      { name: '⚡ Lightning', type: 'badge', price: 100, description: 'Quick and frequent', image_url: '/badges/lightning.png', level_required: 5 },

      // Profile customization items
      { name: 'Golden Border', type: 'avatar', price: 200, description: 'Luxurious golden profile border', image_url: '/avatars/golden.png', level_required: 12 },
      { name: 'Neon Border', type: 'avatar', price: 180, description: 'Glowing neon profile border', image_url: '/avatars/neon.png', level_required: 8 },
      { name: 'Royal Purple', type: 'theme', price: 400, description: 'Elegant purple color scheme', image_url: '/themes/purple.jpg', level_required: 18 }
    ];

    defaultItems.forEach(item => {
      this.db.run(
        'INSERT OR IGNORE INTO store_items (name, type, price, description, image_url, level_required) VALUES (?, ?, ?, ?, ?, ?)',
        [item.name, item.type, item.price, item.description, item.image_url, item.level_required]
      );
    });
  }

  insertDefaultAchievements() {
    const achievements = [
      // Milestones
      { name: 'First Timer', description: 'Complete your first session', badge_emoji: '🥇', category: 'milestones', requirement_type: 'sessions', requirement_value: 1, experience_reward: 10 },
      { name: 'Getting Started', description: 'Complete 5 sessions', badge_emoji: '🌟', category: 'milestones', requirement_type: 'sessions', requirement_value: 5, experience_reward: 25 },
      { name: 'Dedicated', description: 'Complete 25 sessions', badge_emoji: '💪', category: 'milestones', requirement_type: 'sessions', requirement_value: 25, experience_reward: 50 },
      { name: 'Veteran', description: 'Complete 50 sessions', badge_emoji: '🏆', category: 'milestones', requirement_type: 'sessions', requirement_value: 50, experience_reward: 100 },
      { name: 'Century Club', description: 'Complete 100 sessions', badge_emoji: '💯', category: 'milestones', requirement_type: 'sessions', requirement_value: 100, experience_reward: 200 },
      
      // Consistency
      { name: 'Streak Starter', description: 'Achieve a 3-day streak', badge_emoji: '🔥', category: 'consistency', requirement_type: 'streak', requirement_value: 3, experience_reward: 20 },
      { name: 'On Fire', description: 'Achieve a 7-day streak', badge_emoji: '🚀', category: 'consistency', requirement_type: 'streak', requirement_value: 7, experience_reward: 50 },
      { name: 'Unstoppable', description: 'Achieve a 14-day streak', badge_emoji: '⚡', category: 'consistency', requirement_type: 'streak', requirement_value: 14, experience_reward: 100 },
      { name: 'Legend', description: 'Achieve a 30-day streak', badge_emoji: '👑', category: 'consistency', requirement_type: 'streak', requirement_value: 30, experience_reward: 250 },
      
      // Social
      { name: 'Social Butterfly', description: 'Add your first friend', badge_emoji: '🦋', category: 'social', requirement_type: 'friends', requirement_value: 1, experience_reward: 15 },
      { name: 'Popular', description: 'Have 5 friends', badge_emoji: '👥', category: 'social', requirement_type: 'friends', requirement_value: 5, experience_reward: 40 },
      { name: 'Influencer', description: 'Have 10 friends', badge_emoji: '🌟', category: 'social', requirement_type: 'friends', requirement_value: 10, experience_reward: 75 }
    ];

    achievements.forEach(achievement => {
      this.db.run(
        'INSERT OR IGNORE INTO achievements (name, description, badge_emoji, category, requirement_type, requirement_value, experience_reward) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [achievement.name, achievement.description, achievement.badge_emoji, achievement.category, achievement.requirement_type, achievement.requirement_value, achievement.experience_reward]
      );
    });
  }

  // User methods
  createUser(username, password, country = 'Unknown') {
    return new Promise((resolve, reject) => {
      const hashedPassword = bcrypt.hashSync(password, 10);
      this.db.run(
        'INSERT INTO users (username, password, country) VALUES (?, ?, ?)',
        [username, hashedPassword, country],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Level system methods
  calculateLevel(experience) {
    // Level formula: level = floor(sqrt(experience / 100)) + 1
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  getExperienceForNextLevel(currentLevel) {
    // Experience needed for next level
    return Math.pow(currentLevel, 2) * 100;
  }

  updateUserLevel(userId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT experience FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        const newLevel = this.calculateLevel(row.experience);
        this.db.run(
          'UPDATE users SET level = ? WHERE id = ?',
          [newLevel, userId],
          (err) => {
            if (err) reject(err);
            else resolve(newLevel);
          }
        );
      });
    });
  }

  // Session methods with analytics
  addSession(userId, notes = '') {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hourOfDay = now.getHours();

      this.db.run(
        'INSERT INTO sessions (user_id, notes, day_of_week, hour_of_day) VALUES (?, ?, ?, ?)',
        [userId, notes, dayOfWeek, hourOfDay],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Update user stats and check achievements
            db.updateUserStats(userId);
            db.checkAndUnlockAchievements(userId);
            resolve(this.lastID);
          }
        }
      );
    });
  }

  updateUserStats(userId) {
    // Update total sessions, streaks, and add experience
    this.db.run(`
      UPDATE users 
      SET total_sessions = (SELECT COUNT(*) FROM sessions WHERE user_id = ?),
          last_session = CURRENT_TIMESTAMP,
          experience = experience + 10
      WHERE id = ?
    `, [userId, userId]);

    // Update level based on new experience
    this.updateUserLevel(userId);
    
    // Update current streak
    this.updateCurrentStreak(userId);
  }

  updateCurrentStreak(userId) {
    // Calculate current streak
    this.db.all(`
      SELECT DATE(timestamp) as session_date 
      FROM sessions 
      WHERE user_id = ? 
      ORDER BY timestamp DESC
    `, [userId], (err, rows) => {
      if (err) return;

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (let row of rows) {
        const sessionDate = new Date(row.session_date);
        const dayDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === streak) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Update current and longest streak
      this.db.run(`
        UPDATE users 
        SET current_streak = ?,
            longest_streak = MAX(longest_streak, ?)
        WHERE id = ?
      `, [streak, streak, userId]);
    });
  }

  // Achievement methods
  checkAndUnlockAchievements(userId) {
    // Get user stats
    this.db.get(`
      SELECT total_sessions, longest_streak, 
             (SELECT COUNT(*) FROM friends WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted') as friend_count,
             unlocked_achievements
      FROM users WHERE id = ?
    `, [userId, userId, userId], (err, user) => {
      if (err) return;

      const unlockedIds = JSON.parse(user.unlocked_achievements || '[]');

      // Check all achievements
      this.db.all('SELECT * FROM achievements', (err, achievements) => {
        if (err) return;

        achievements.forEach(achievement => {
          if (unlockedIds.includes(achievement.id)) return;

          let qualified = false;
          switch (achievement.requirement_type) {
            case 'sessions':
              qualified = user.total_sessions >= achievement.requirement_value;
              break;
            case 'streak':
              qualified = user.longest_streak >= achievement.requirement_value;
              break;
            case 'friends':
              qualified = user.friend_count >= achievement.requirement_value;
              break;
          }

          if (qualified) {
            this.unlockAchievement(userId, achievement.id, achievement.experience_reward);
          }
        });
      });
    });
  }

  unlockAchievement(userId, achievementId, experienceReward) {
    // Add to user_achievements
    this.db.run(
      'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
      [userId, achievementId]
    );

    // Update user's unlocked achievements and add experience
    this.db.get('SELECT unlocked_achievements FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) return;

      const unlockedIds = JSON.parse(row.unlocked_achievements || '[]');
      if (!unlockedIds.includes(achievementId)) {
        unlockedIds.push(achievementId);
        
        this.db.run(`
          UPDATE users 
          SET unlocked_achievements = ?, experience = experience + ?
          WHERE id = ?
        `, [JSON.stringify(unlockedIds), experienceReward, userId]);

        this.updateUserLevel(userId);
      }
    });
  }

  // Analytics methods
  getUserAnalytics(userId) {
    return new Promise((resolve, reject) => {
      const analytics = {};

      // Get basic stats
      this.db.get(`
        SELECT total_sessions, current_streak, longest_streak, level, experience,
               DATE(created_at) as join_date
        FROM users WHERE id = ?
      `, [userId], (err, userStats) => {
        if (err) {
          reject(err);
          return;
        }

        analytics.basicStats = userStats;

        // Get session patterns
        this.db.all(`
          SELECT 
            day_of_week,
            hour_of_day,
            COUNT(*) as session_count,
            DATE(timestamp) as session_date
          FROM sessions 
          WHERE user_id = ?
          GROUP BY day_of_week, hour_of_day
          ORDER BY session_count DESC
        `, [userId], (err, patterns) => {
          if (err) {
            reject(err);
            return;
          }

          // Calculate best day and time
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayCounts = new Array(7).fill(0);
          const hourCounts = new Array(24).fill(0);

          patterns.forEach(pattern => {
            dayCounts[pattern.day_of_week] += pattern.session_count;
            hourCounts[pattern.hour_of_day] += pattern.session_count;
          });

          const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
          const bestHour = hourCounts.indexOf(Math.max(...hourCounts));

          analytics.patterns = {
            bestDay: dayNames[bestDayIndex],
            bestHour: bestHour,
            dayCounts,
            hourCounts
          };

          // Get monthly trends
          this.db.all(`
            SELECT 
              strftime('%Y-%m', timestamp) as month,
              COUNT(*) as sessions
            FROM sessions 
            WHERE user_id = ?
            GROUP BY strftime('%Y-%m', timestamp)
            ORDER BY month DESC
            LIMIT 6
          `, [userId], (err, monthlyData) => {
            if (err) {
              reject(err);
              return;
            }

            analytics.monthlyTrends = monthlyData.reverse();

            // Calculate consistency score (sessions per day since joining)
            const joinDate = new Date(userStats.join_date);
            const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
            const consistencyScore = Math.min(100, Math.round((userStats.total_sessions / daysSinceJoin) * 100));

            analytics.consistencyScore = consistencyScore;

            resolve(analytics);
          });
        });
      });
    });
  }

  // Social reactions methods
  addReaction(userId, targetUserId, targetType, targetId, reactionType) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO social_reactions (user_id, target_user_id, target_type, target_id, reaction_type) VALUES (?, ?, ?, ?, ?)',
        [userId, targetUserId, targetType, targetId, reactionType],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getReactions(targetType, targetId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT sr.reaction_type, u.username, sr.created_at
        FROM social_reactions sr
        JOIN users u ON sr.user_id = u.id
        WHERE sr.target_type = ? AND sr.target_id = ?
        ORDER BY sr.created_at DESC
      `, [targetType, targetId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Existing methods remain the same...
  getGlobalLeaderboard(limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT username, total_sessions, badges, country, level 
         FROM users 
         ORDER BY total_sessions DESC 
         LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getCountryLeaderboard(country, limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT username, total_sessions, badges, country, level 
         FROM users 
         WHERE country = ?
         ORDER BY total_sessions DESC 
         LIMIT ?`,
        [country, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getFriendsLeaderboard(userId, limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT u.username, u.total_sessions, u.badges, u.country, u.level
         FROM users u
         INNER JOIN friends f ON (f.friend_id = u.id OR f.user_id = u.id)
         WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted' AND u.id != ?
         ORDER BY u.total_sessions DESC
         LIMIT ?`,
        [userId, userId, userId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getStoreItems() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM store_items ORDER BY type, level_required, price', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getUserPurchases(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT si.* FROM store_items si
         INNER JOIN user_purchases up ON si.id = up.item_id
         WHERE up.user_id = ?`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  purchaseItem(userId, itemId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO user_purchases (user_id, item_id) VALUES (?, ?)',
        [userId, itemId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  getUserAchievements(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT a.*, ua.unlocked_at
        FROM achievements a
        INNER JOIN user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = ?
        ORDER BY ua.unlocked_at DESC
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getAllAchievements() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM achievements ORDER BY category, requirement_value', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

const db = new Database();
module.exports = db;