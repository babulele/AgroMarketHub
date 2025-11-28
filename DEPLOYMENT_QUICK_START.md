# Quick Start Deployment Guide

This is a condensed version of the full deployment guide. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Prerequisites Checklist

- [ ] GitHub repository with your code
- [ ] MongoDB Atlas account (free tier)
- [ ] Cloudinary account (free tier)
- [ ] Gmail account (for email service)
- [ ] M-Pesa Daraja API credentials
- [ ] OpenWeatherMap API key (for AI service)

---

## Step-by-Step Quick Deploy

### 1. MongoDB Atlas (5 minutes)

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP: `0.0.0.0/0`
4. Copy connection string

### 2. Redis Setup (2 minutes)

**Option A: Render Redis**
- Render Dashboard → New → Redis
- Name: `agromarkethub-redis`
- Copy Internal URL

**Option B: Upstash**
- [upstash.com](https://upstash.com) → Create Redis
- Copy REST URL

### 3. Deploy Backend to Render (10 minutes)

1. **Render Dashboard** → New → Web Service
2. **Connect GitHub** repository
3. **Settings:**
   ```
   Name: agromarkethub-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
4. **Add Environment Variables** (see full guide for complete list):
   - `MONGODB_URI` (from step 1)
   - `JWT_SECRET` (generate: `openssl rand -base64 32`)
   - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (from step 2)
   - Cloudinary credentials
   - Email credentials
   - M-Pesa credentials
5. **Deploy** and copy URL: `https://agromarkethub-backend.onrender.com`

### 4. Deploy AI Service to Render (10 minutes)

1. **Render Dashboard** → New → Web Service
2. **Connect same GitHub** repository
3. **Settings:**
   ```
   Name: agromarkethub-ai-service
   Root Directory: ai-service
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. **Add Environment Variables:**
   - `MONGODB_URI` (same as backend)
   - `MONGODB_DB_NAME=agromarkethub`
   - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
   - `WEATHER_API_KEY`
5. **Deploy** and copy URL: `https://agromarkethub-ai-service.onrender.com`

### 5. Update Backend with AI Service URL

1. Go to backend service on Render
2. Add/Update: `AI_SERVICE_URL=https://agromarkethub-ai-service.onrender.com/api/v1`
3. Redeploy

### 6. Deploy Frontend to Vercel (5 minutes)

1. **Vercel Dashboard** → Add New → Project
2. **Import GitHub** repository
3. **Settings:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. **Add Environment Variables:**
   ```
   VITE_API_URL=https://agromarkethub-backend.onrender.com/api/v1
   VITE_AI_SERVICE_URL=https://agromarkethub-ai-service.onrender.com/api/v1
   ```
5. **Deploy** and copy URL: `https://your-project.vercel.app`

### 7. Update CORS (5 minutes)

**Backend (Render):**
- Update `ALLOWED_ORIGINS` to include your Vercel URL

**AI Service (Render):**
- Update `ALLOWED_ORIGINS` to include your Vercel URL

**Redeploy both services**

### 8. Update M-Pesa Callback

1. Safaricom Developer Portal
2. Update callback URL: `https://agromarkethub-backend.onrender.com/api/v1/mpesa/callback`

---

## Environment Variables Reference

### Backend (Render)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/agromarkethub?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_SERVICE=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAILS=admin@example.com
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_ENVIRONMENT=production
MPESA_CALLBACK_URL=https://agromarkethub-backend.onrender.com/api/v1/mpesa/callback
AI_SERVICE_URL=https://agromarkethub-ai-service.onrender.com/api/v1
ALLOWED_ORIGINS=https://your-project.vercel.app,http://localhost:3000
```

### AI Service (Render)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/agromarkethub?retryWrites=true&w=majority
MONGODB_DB_NAME=agromarkethub
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
WEATHER_API_KEY=your-weather-api-key
ALLOWED_ORIGINS=https://your-project.vercel.app,https://agromarkethub-backend.onrender.com
```

### Frontend (Vercel)

```env
VITE_API_URL=https://agromarkethub-backend.onrender.com/api/v1
VITE_AI_SERVICE_URL=https://agromarkethub-ai-service.onrender.com/api/v1
```

---

## Testing After Deployment

1. **Health Checks:**
   - Backend: `https://agromarkethub-backend.onrender.com/health`
   - AI Service: `https://agromarkethub-ai-service.onrender.com/health`

2. **Test User Flow:**
   - Register new user
   - Login
   - Create product (farmer)
   - Browse products (buyer)
   - Create order
   - Test payment (M-Pesa sandbox)

---

## Common Issues & Solutions

### Backend returns 503
- Service is spinning up (free tier limitation)
- Wait 30-60 seconds and retry

### CORS errors
- Verify `ALLOWED_ORIGINS` includes exact frontend URL
- No trailing slashes in URLs

### Database connection fails
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify connection string format

### Build fails
- Check Render/Vercel build logs
- Verify all environment variables are set
- Check for TypeScript errors

---

## Next Steps

- [ ] Set up custom domains
- [ ] Configure monitoring/alerts
- [ ] Set up database backups
- [ ] Enable production M-Pesa
- [ ] Set up CI/CD pipelines
- [ ] Configure rate limiting
- [ ] Set up error tracking (Sentry)

---

## Support

For detailed instructions, troubleshooting, and best practices, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).


