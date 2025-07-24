const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, country } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (username.length < 3 || password.length < 6) {
      return res.status(400).json({ error: 'Username must be at least 3 characters, password at least 6' });
    }

    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const userId = await db.createUser(username, password, country);
    const token = jwt.sign({ userId, username }, JWT_SECRET);

    res.json({ token, user: { id: userId, username, country, level: 1, experience: 0 } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    
    // Add level progression info
    const nextLevelExp = db.getExperienceForNextLevel(user.level);
    const currentLevelExp = user.level > 1 ? db.getExperienceForNextLevel(user.level - 1) : 0;
    const progressToNext = user.experience - currentLevelExp;
    const expNeededForNext = nextLevelExp - currentLevelExp;
    
    userWithoutPassword.levelProgress = {
      current: progressToNext,
      needed: expNeededForNext,
      percentage: Math.round((progressToNext / expNeededForNext) * 100)
    };

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Session routes
app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const sessionId = await db.addSession(req.user.userId, notes);
    res.json({ id: sessionId, message: 'Session recorded successfully! +10 XP' });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Failed to record session' });
  }
});

// Analytics routes
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = await db.getUserAnalytics(req.user.userId);
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Achievement routes
app.get('/api/achievements', authenticateToken, async (req, res) => {
  try {
    const [userAchievements, allAchievements] = await Promise.all([
      db.getUserAchievements(req.user.userId),
      db.getAllAchievements()
    ]);

    const unlockedIds = userAchievements.map(a => a.id);
    
    const response = {
      unlocked: userAchievements,
      available: allAchievements.filter(a => !unlockedIds.includes(a.id)),
      totalUnlocked: userAchievements.length,
      totalAvailable: allAchievements.length
    };

    res.json(response);
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

// Social reactions routes
app.post('/api/reactions', authenticateToken, async (req, res) => {
  try {
    const { targetUserId, targetType, targetId, reactionType } = req.body;
    
    if (!['like', 'fire', 'cheer', 'wow'].includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    if (!['session', 'achievement', 'streak'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    const reactionId = await db.addReaction(req.user.userId, targetUserId, targetType, targetId, reactionType);
    res.json({ id: reactionId, message: 'Reaction added!' });
  } catch (error) {
    console.error('Reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

app.get('/api/reactions/:targetType/:targetId', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const reactions = await db.getReactions(targetType, targetId);
    
    // Group reactions by type
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.reaction_type]) {
        acc[reaction.reaction_type] = [];
      }
      acc[reaction.reaction_type].push({
        username: reaction.username,
        created_at: reaction.created_at
      });
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ error: 'Failed to get reactions' });
  }
});

// Leaderboard routes (updated to include level)
app.get('/api/leaderboard/global', authenticateToken, async (req, res) => {
  try {
    const leaderboard = await db.getGlobalLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Global leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get global leaderboard' });
  }
});

app.get('/api/leaderboard/country/:country', authenticateToken, async (req, res) => {
  try {
    const { country } = req.params;
    const leaderboard = await db.getCountryLeaderboard(country);
    res.json(leaderboard);
  } catch (error) {
    console.error('Country leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get country leaderboard' });
  }
});

app.get('/api/leaderboard/friends', authenticateToken, async (req, res) => {
  try {
    const leaderboard = await db.getFriendsLeaderboard(req.user.userId);
    res.json(leaderboard);
  } catch (error) {
    console.error('Friends leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get friends leaderboard' });
  }
});

// Friends routes
app.post('/api/friends/add', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    
    const friend = await db.getUserByUsername(username);
    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (friend.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot add yourself as friend' });
    }

    // Add friend request logic here
    res.json({ message: 'Friend request sent!' });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// Store routes (updated to include level requirements)
app.get('/api/store/items', authenticateToken, async (req, res) => {
  try {
    const items = await db.getStoreItems();
    const user = await db.getUserById(req.user.userId);
    
    // Add availability info based on user level
    const itemsWithAvailability = items.map(item => ({
      ...item,
      available: user.level >= item.level_required,
      levelRequired: item.level_required
    }));
    
    res.json(itemsWithAvailability);
  } catch (error) {
    console.error('Store items error:', error);
    res.status(500).json({ error: 'Failed to get store items' });
  }
});

app.get('/api/store/purchases', authenticateToken, async (req, res) => {
  try {
    const purchases = await db.getUserPurchases(req.user.userId);
    res.json(purchases);
  } catch (error) {
    console.error('User purchases error:', error);
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

app.post('/api/store/purchase', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    
    // Check if user can afford and has required level
    const [item, user] = await Promise.all([
      db.getStoreItems().then(items => items.find(i => i.id === itemId)),
      db.getUserById(req.user.userId)
    ]);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (user.level < item.level_required) {
      return res.status(400).json({ error: `Level ${item.level_required} required` });
    }

    if (user.total_sessions < item.price) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    const success = await db.purchaseItem(req.user.userId, itemId);
    
    if (success) {
      res.json({ message: 'Item purchased successfully!' });
    } else {
      res.status(400).json({ error: 'Item already owned or purchase failed' });
    }
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to purchase item' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});