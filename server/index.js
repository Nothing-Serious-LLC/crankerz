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
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? [CORS_ORIGIN, 'https://crankerz.com', 'https://www.crankerz.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced rate limiting with environment variables
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // limit each IP to 5 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);

// Input validation middleware
const validateInput = (req, res, next) => {
  // Remove any potential XSS
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]).trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }
  next();
};

app.use(validateInput);

// Enhanced auth middleware with better error handling
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: 'Invalid token' });
      }
      return res.status(403).json({ error: 'Token verification failed' });
    }
    req.user = user;
    next();
  });
};

// Validation functions
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 20) return false;
  // Allow alphanumeric, underscore, hyphen
  return /^[a-zA-Z0-9_-]+$/.test(username);
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 6 || password.length > 128) return false;
  return true;
};

const validateCountry = (country) => {
  if (!country || typeof country !== 'string') return false;
  if (country.length < 2 || country.length > 50) return false;
  return /^[a-zA-Z\s-]+$/.test(country);
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV
  });
});

// Auth routes with enhanced validation
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, country } = req.body;
    
    // Enhanced validation
    if (!validateUsername(username)) {
      return res.status(400).json({ 
        error: 'Username must be 3-20 characters and contain only letters, numbers, underscore, or hyphen' 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be 6-128 characters long' 
      });
    }

    if (!validateCountry(country)) {
      return res.status(400).json({ 
        error: 'Please select a valid country' 
      });
    }

    // Check if username already exists
    const existingUser = await db.getUserByUsername(username.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const userId = await db.createUser(username.toLowerCase(), password, country);
    const token = jwt.sign(
      { userId, username: username.toLowerCase() }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: userId, 
        username: username.toLowerCase(), 
        country, 
        level: 1, 
        experience: 0 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!validateUsername(username) || !validatePassword(password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = await db.getUserByUsername(username.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// User profile with better error handling
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
      current: Math.max(0, progressToNext),
      needed: expNeededForNext,
      percentage: Math.min(100, Math.max(0, Math.round((progressToNext / expNeededForNext) * 100)))
    };

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Session routes with validation
app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    
    // Validate notes if provided
    if (notes && (typeof notes !== 'string' || notes.length > 500)) {
      return res.status(400).json({ error: 'Notes must be less than 500 characters' });
    }

    const sessionId = await db.addSession(req.user.userId, notes || '');
    res.status(201).json({ id: sessionId, message: 'Session recorded successfully! +10 XP' });
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

// Social reactions routes with validation
app.post('/api/reactions', authenticateToken, async (req, res) => {
  try {
    const { targetUserId, targetType, targetId, reactionType } = req.body;
    
    if (!['like', 'fire', 'cheer', 'wow'].includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    if (!['session', 'achievement', 'streak'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    if (!Number.isInteger(targetUserId) || !Number.isInteger(targetId)) {
      return res.status(400).json({ error: 'Invalid target parameters' });
    }

    const reactionId = await db.addReaction(req.user.userId, targetUserId, targetType, targetId, reactionType);
    res.status(201).json({ id: reactionId, message: 'Reaction added!' });
  } catch (error) {
    console.error('Reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

app.get('/api/reactions/:targetType/:targetId', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    
    if (!['session', 'achievement', 'streak'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    if (!Number.isInteger(parseInt(targetId))) {
      return res.status(400).json({ error: 'Invalid target ID' });
    }

    const reactions = await db.getReactions(targetType, parseInt(targetId));
    
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
    
    if (!validateCountry(country)) {
      return res.status(400).json({ error: 'Invalid country parameter' });
    }

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
    
    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const friend = await db.getUserByUsername(username.toLowerCase());
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
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
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
    
    if (!Number.isInteger(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    // Check if user can afford and has required level
    const [item, user] = await Promise.all([
      db.getStoreItems().then(items => items.find(i => i.id === itemId)),
      db.getUserById(req.user.userId)
    ]);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.level < item.level_required) {
      return res.status(403).json({ error: `Level ${item.level_required} required` });
    }

    if (user.total_sessions < item.price) {
      return res.status(402).json({ error: 'Insufficient points' });
    }

    const success = await db.purchaseItem(req.user.userId, itemId);
    
    if (success) {
      res.status(201).json({ message: 'Item purchased successfully!' });
    } else {
      res.status(409).json({ error: 'Item already owned or purchase failed' });
    }
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to purchase item' });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(NODE_ENV === 'development' && { details: error.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Crankerz Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 CORS Origin: ${CORS_ORIGIN}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET ? 'Configured' : 'Using fallback'}`);
});