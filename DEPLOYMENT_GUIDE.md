# 🚀 FapTracker Deployment Guide - crankerz.com

## 🎯 **DEPLOYMENT OVERVIEW**

**Domain**: crankerz.com  
**Platform**: Vercel (Recommended)  
**Stack**: React Frontend + Node.js API  
**Database**: SQLite (file-based)  

---

## 📋 **REQUIRED ENVIRONMENT VARIABLES**

### 🖥️ **Server Environment Variables (.env)**

Create `server/.env` with these values:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Security (CRITICAL - Change these!)
JWT_SECRET=faptracker-super-secret-jwt-key-2025-crankerz-production-secure-token-xyz789
CORS_ORIGIN=https://crankerz.com

# Database
DATABASE_PATH=./fap_tracker.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

### 🌐 **Client Environment Variables (.env)**

Create `client/.env` with these values:

```bash
# API Configuration
REACT_APP_API_URL=https://crankerz.com/api

# Environment
REACT_APP_ENV=production
```

---

## 🔧 **VERCEL DEPLOYMENT SETUP**

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Configure Environment Variables in Vercel Dashboard**

Go to [vercel.com](https://vercel.com) → Your Project → Settings → Environment Variables

Add these variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `JWT_SECRET` | `faptracker-super-secret-jwt-key-2025-crankerz-production-secure-token-xyz789` | Production |
| `CORS_ORIGIN` | `https://crankerz.com` | Production |
| `DATABASE_PATH` | `./fap_tracker.db` | Production |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Production |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Production |
| `AUTH_RATE_LIMIT_MAX` | `5` | Production |
| `REACT_APP_API_URL` | `https://crankerz.com/api` | Production |
| `REACT_APP_ENV` | `production` | Production |

### **Step 4: Deploy to Vercel**
```bash
# From the root directory
vercel --prod
```

### **Step 5: Configure Custom Domain**

In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add `crankerz.com` and `www.crankerz.com`
3. Follow DNS configuration instructions

---

## 🌐 **DNS CONFIGURATION**

Configure your DNS provider (where crankerz.com is registered):

### **A Records**
```
A    @     76.76.19.61 (Vercel IP)
A    www   76.76.19.61 (Vercel IP)
```

### **CNAME Records** (Alternative)
```
CNAME  @     cname.vercel-dns.com
CNAME  www   cname.vercel-dns.com
```

---

## 🔒 **SECURITY CHECKLIST**

### **✅ Must-Do Before Going Live:**

1. **Change JWT Secret**
   ```bash
   # Generate a strong JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Update CORS Origins**
   ```bash
   CORS_ORIGIN=https://crankerz.com
   ```

3. **Set Production Environment**
   ```bash
   NODE_ENV=production
   ```

4. **Enable HTTPS Only**
   - Vercel automatically provides SSL
   - Ensure all API calls use HTTPS

5. **Database Security**
   - SQLite file is included in deployment
   - Consider database backups

---

## 📂 **FILE STRUCTURE FOR DEPLOYMENT**

```
crankerz/
├── 📄 vercel.json (Vercel config)
├── 📄 package.json (Root package with build scripts)
├── 📁 client/
│   ├── 📄 .env (Client environment variables)
│   ├── 📄 package.json (Updated with homepage)
│   └── 📁 build/ (Generated during deployment)
└── 📁 server/
    ├── 📄 .env (Server environment variables)
    ├── 📄 index.js (Updated with env vars)
    ├── 📄 database.js
    └── 📄 fap_tracker.db
```

---

## 🚀 **DEPLOYMENT COMMANDS**

### **Local Development**
```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

### **Production Build**
```bash
# Build for production
npm run build:all

# Test production build locally
npm start
```

### **Deploy to Vercel**
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

---

## 🔍 **VERIFICATION STEPS**

After deployment, verify these endpoints:

### **✅ Health Check**
```bash
curl https://crankerz.com/api/health
```
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-24T...",
  "version": "1.0.0",
  "environment": "production"
}
```

### **✅ Frontend Loading**
- Visit https://crankerz.com
- Should load React app with login screen
- Check browser console for errors

### **✅ API Connectivity**
- Try registering a new account
- Test login functionality
- Verify all features work

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

1. **CORS Errors**
   ```bash
   # Check CORS_ORIGIN in server/.env
   CORS_ORIGIN=https://crankerz.com
   ```

2. **API Not Found (404)**
   ```bash
   # Verify API URL in client/.env
   REACT_APP_API_URL=https://crankerz.com/api
   ```

3. **Database Issues**
   ```bash
   # Check database path
   DATABASE_PATH=./fap_tracker.db
   ```

4. **JWT Errors**
   ```bash
   # Ensure JWT_SECRET is set
   JWT_SECRET=your-super-long-secret-key
   ```

---

## 📊 **MONITORING & MAINTENANCE**

### **Performance Monitoring**
- Use Vercel Analytics
- Monitor API response times
- Check error rates

### **Database Backups**
- Download `fap_tracker.db` regularly
- Consider automated backup solution

### **Security Updates**
- Rotate JWT secret periodically
- Monitor for dependency vulnerabilities
- Update packages regularly

---

## 🎯 **POST-DEPLOYMENT CHECKLIST**

- [ ] Domain points to Vercel deployment
- [ ] HTTPS is working (SSL certificate)
- [ ] All environment variables are set
- [ ] API endpoints respond correctly
- [ ] Frontend loads without errors
- [ ] User registration/login works
- [ ] All features are functional
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags are correct
- [ ] Analytics tracking (if added)

---

## 📞 **SUPPORT**

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for frontend errors

**🎉 Once deployed, FapTracker will be live at https://crankerz.com!**

---

*Last updated: January 24, 2025*