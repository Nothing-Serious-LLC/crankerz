const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.db = new sqlite3.Database('./fap_tracker.db');
    this.init();
  }

  init() {
    // Users table
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
        badges TEXT DEFAULT '[]'
      )
    `);

    // Sessions table (masturbation check-ins)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
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
        type TEXT NOT NULL, -- 'skin' or 'badge'
        price INTEGER NOT NULL,
        description TEXT,
        image_url TEXT,
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

    // Insert default store items
    this.insertDefaultStoreItems();
  }

  insertDefaultStoreItems() {
    const defaultItems = [
      // Skins
      { name: 'Fire Theme', type: 'skin', price: 100, description: 'Hot red and orange theme', image_url: '/skins/fire.jpg' },
      { name: 'Ocean Theme', type: 'skin', price: 150, description: 'Cool blue ocean vibes', image_url: '/skins/ocean.jpg' },
      { name: 'Dark Mode Pro', type: 'skin', price: 200, description: 'Premium dark theme', image_url: '/skins/dark.jpg' },
      { name: 'Neon Glow', type: 'skin', price: 250, description: 'Cyberpunk neon aesthetic', image_url: '/skins/neon.jpg' },
      
      // Badges
      { name: '🔥 Hot Streak', type: 'badge', price: 50, description: 'For the dedicated', image_url: '/badges/hot.png' },
      { name: '👑 King', type: 'badge', price: 300, description: 'Royal status', image_url: '/badges/king.png' },
      { name: '💎 Diamond', type: 'badge', price: 500, description: 'Premium member', image_url: '/badges/diamond.png' },
      { name: '🚀 Rocket', type: 'badge', price: 150, description: 'Sky high performance', image_url: '/badges/rocket.png' },
      { name: '⚡ Lightning', type: 'badge', price: 100, description: 'Quick and frequent', image_url: '/badges/lightning.png' }
    ];

    defaultItems.forEach(item => {
      this.db.run(
        'INSERT OR IGNORE INTO store_items (name, type, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [item.name, item.type, item.price, item.description, item.image_url]
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

  // Session methods
  addSession(userId, notes = '') {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO sessions (user_id, notes) VALUES (?, ?)',
        [userId, notes],
        function(err) {
          if (err) reject(err);
          else {
            // Update user stats
            db.updateUserStats(userId);
            resolve(this.lastID);
          }
        }
      );
    });
  }

  updateUserStats(userId) {
    this.db.run(`
      UPDATE users 
      SET total_sessions = (SELECT COUNT(*) FROM sessions WHERE user_id = ?),
          last_session = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [userId, userId]);
  }

  // Leaderboard methods
  getGlobalLeaderboard(limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT username, total_sessions, badges, country 
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
        `SELECT username, total_sessions, badges, country 
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
        `SELECT u.username, u.total_sessions, u.badges, u.country
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

  // Store methods
  getStoreItems() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM store_items ORDER BY type, price', (err, rows) => {
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
}

const db = new Database();
module.exports = db;