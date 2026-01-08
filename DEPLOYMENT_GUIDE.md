# Backend Deployment Guide

## Important Note About Netlify

**Netlify is primarily designed for static sites and serverless functions.** Your Express.js backend with PostgreSQL is a full Node.js application that requires:
- Continuous server process
- Database connections
- File uploads
- Persistent storage

For this type of backend, you have two main options:

---

## Option 1: Deploy to a Node.js-Friendly Platform (Recommended)

### Best Platforms for Express Backends:

#### 1. **Railway** (Easiest - Recommended)
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL database
- ✅ Simple setup

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js
6. Add PostgreSQL database:
   - Click "+ New" → "Database" → "PostgreSQL"
7. Set environment variables:
   - `DATABASE_URL` (Railway provides this automatically)
   - `JWT_SECRET` (your secret key)
   - `NODE_ENV=production`
   - `PORT` (Railway sets this automatically)
8. Deploy!

**Your backend will be available at:** `https://your-app-name.railway.app`

---

#### 2. **Render** (Great Alternative)
- ✅ Free tier available
- ✅ Automatic deployments
- ✅ PostgreSQL support

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** `backend`
6. Add PostgreSQL database:
   - Click "New" → "PostgreSQL"
7. Set environment variables (same as Railway)
8. Deploy!

---

#### 3. **Fly.io** (Good for Global Distribution)
- ✅ Free tier available
- ✅ Global edge deployment

**Steps:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in your backend directory
3. Follow the prompts
4. Add PostgreSQL: `fly postgres create`
5. Set environment variables
6. Deploy: `fly deploy`

---

## Option 2: Convert to Netlify Functions (Advanced)

If you **must** use Netlify, you'll need to convert your Express routes to serverless functions. This requires significant refactoring.

### Setup Netlify Functions:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Create `netlify.toml` in your backend directory:**
   ```toml
   [build]
     functions = "netlify/functions"
     command = "npm install"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

3. **Create `netlify/functions` directory structure:**
   ```
   backend/
     netlify/
       functions/
         api/
           auth.js
           products.js
           cart.js
           ... (one function per route group)
   ```

4. **Convert Express routes to serverless functions:**
   Each route group becomes a separate function file.

**Example conversion:**
```javascript
// netlify/functions/api/products.js
import { handler } from '@netlify/functions'
import express from 'express'
import serverless from 'serverless-http'

const app = express()
// ... your routes

export const handler = serverless(app)
```

### Limitations:
- ❌ No persistent file storage (uploads won't work the same way)
- ❌ Cold starts (slower first request)
- ❌ More complex setup
- ❌ Database connection pooling issues
- ❌ Function timeout limits

---

## Recommended Approach

**For your Express.js + PostgreSQL backend, I strongly recommend Railway or Render** because:
1. ✅ Zero refactoring needed
2. ✅ Better performance
3. ✅ Easier database management
4. ✅ File uploads work out of the box
5. ✅ Better for production workloads

---

## Environment Variables to Set

Regardless of which platform you choose, set these:

```env
NODE_ENV=production
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001  # (usually auto-set by platform)
```

---

## Frontend Configuration

After deploying your backend, update your frontend API base URL:

**In `src/utils/api.js`:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.railway.app'
```

**Create `.env` file in root:**
```env
VITE_API_URL=https://your-backend-url.railway.app
```

---

## Quick Start with Railway (Recommended)

1. **Push your code to GitHub** (if not already)
2. **Go to railway.app** and sign up
3. **Deploy from GitHub** - select your repo
4. **Add PostgreSQL** database
5. **Set environment variables**
6. **Deploy!**

Your backend will be live in minutes! 🚀

---

## Need Help?

If you want me to help you set up deployment for a specific platform, let me know which one you prefer!
