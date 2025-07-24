# 🍆 FapTracker

A modern, mobile-first social platform for tracking masturbation habits with friends. Built with React, TypeScript, Node.js, and SQLite.

## 🌟 Features

### 🏠 Home Tab
- **Large Check-in Button**: Easy one-tap session logging
- **User Statistics**: Track total sessions, current streak, and best streak
- **Customizable Themes**: Different skins for the check-in button
- **Daily Limit**: Prevents multiple check-ins per day
- **Motivational Messages**: Funny, encouraging messages

### 👥 Community Tab
- **Three Leaderboards**:
  - Friends leaderboard
  - Country-based leaderboard  
  - Global leaderboard
- **Friend System**: Add friends by username
- **Ranking System**: Gold, silver, bronze medals for top 3
- **User Profiles**: Display badges and country info

### 🛒 Store Tab
- **Skins**: Customize check-in button appearance
  - Fire Theme (red/orange)
  - Ocean Theme (blue/teal)
  - Dark Mode Pro (dark theme)
  - Neon Glow (cyberpunk style)
- **Badges**: Display status symbols next to username
  - 🔥 Hot Streak, 👑 King, 💎 Diamond, 🚀 Rocket, ⚡ Lightning
- **Points System**: Earn points through sessions to buy items
- **Purchase History**: Track owned items

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Styled Components** for CSS-in-JS styling
- **Axios** for API requests
- **Context API** for state management
- **Mobile-first responsive design**

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **Rate limiting** and security headers
- **RESTful API design**

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd fap-tracker
npm run install-all
```

2. **Start the development servers**:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend app on http://localhost:3000

### Manual Setup

If you prefer to run them separately:

**Backend**:
```bash
cd server
npm install
npm run dev
```

**Frontend**:
```bash
cd client
npm install
npm start
```

## 📱 Usage

1. **Register**: Create an account with username, password, and country
2. **Check-in**: Tap the large button on home screen to log a session
3. **Compete**: View leaderboards and add friends in Community tab
4. **Customize**: Buy skins and badges in the Store using earned points
5. **Track Progress**: Monitor your stats and streaks

## 🎨 Design Features

- **Modern Glass-morphism UI**: Frosted glass effects with blur
- **Gradient Backgrounds**: Beautiful color transitions
- **Mobile-first**: Optimized for phone usage
- **Bottom Navigation**: Easy thumb navigation
- **Smooth Animations**: Hover effects and transitions
- **Accessibility**: Focus states and reduced motion support

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User & Sessions  
- `GET /api/user/profile` - Get user profile
- `POST /api/sessions` - Add new session

### Leaderboards
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/country/:country` - Country leaderboard  
- `GET /api/leaderboard/friends` - Friends leaderboard

### Store
- `GET /api/store/items` - Get all store items
- `GET /api/store/purchases` - Get user purchases
- `POST /api/store/purchase` - Purchase item

### Friends
- `POST /api/friends/add` - Add friend by username

## 🗄️ Database Schema

### Users Table
- `id`, `username`, `password`, `country`
- `total_sessions`, `current_streak`, `longest_streak`
- `active_skin`, `badges`, `created_at`

### Sessions Table
- `id`, `user_id`, `timestamp`, `notes`

### Store Items Table
- `id`, `name`, `type`, `price`, `description`, `image_url`

### Friends & Purchases Tables
- Friend relationships and purchase history

## 🎯 Roadmap

- [ ] Push notifications for daily reminders
- [ ] Achievement system with unlockable content
- [ ] Social feed with session updates
- [ ] Advanced statistics and charts
- [ ] Mobile app with React Native
- [ ] Group challenges and competitions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## ⚠️ Disclaimer

This application is intended for adult users only and is meant to be humorous and social in nature. Please use responsibly and respect all users.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ and a sense of humor. Happy tracking! 🍆