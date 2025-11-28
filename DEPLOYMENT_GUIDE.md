# AgroMarketHub Deployment Guide

This guide covers deploying the AgroMarketHub application to:
- **Frontend**: Vercel
- **Backend**: Render
- **AI Service**: Render

## Prerequisites

1. GitHub account with the repository
2. Vercel account (free tier available)
3. Render account (free tier available)
4. MongoDB Atlas account (free tier available)
5. Cloudinary account (free tier available)
6. Redis account (Render Redis or Upstash - free tier available)

---

## Step 1: Prepare Your Repository

### 1.1 Ensure All Environment Variables Are Documented

Make sure you have `.env.example` files in each service directory:
- `frontend/.env.example`
- `backend/.env.example`
- `ai-service/env.example`

### 1.2 Update Build Scripts

Ensure your `package.json` files have proper build scripts:

**Frontend (`frontend/package.json`):**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Backend (`backend/package.json`):**
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
  }
}
```

**AI Service (`ai-service/requirements.txt`):**
Ensure all dependencies are listed.

---

## Step 2: MongoDB Atlas Setup

### 2.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create a database user:
   - Username: `agromarkethub`
   - Password: Generate a strong password (save it!)
4. Whitelist IP addresses:
   - For Render: `0.0.0.0/0` (allow all IPs)
   - Or add specific Render IPs if you prefer
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/agromarkethub?retryWrites=true&w=majority`

### 2.2 Update Connection String

Replace `<password>` with your database user password:
```
mongodb+srv://agromarkethub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agromarkethub?retryWrites=true&w=majority
```

---

## Step 3: Redis Setup

### Option A: Render Redis (Recommended)

1. Go to Render Dashboard
2. Click "New" → "Redis"
3. Name it: `agromarkethub-redis`
4. Plan: Free tier
5. Copy the **Internal Redis URL** (for Render services) and **External Redis URL** (for external access)

### Option B: Upstash Redis

1. Go to [Upstash](https://upstash.com/)
2. Create a free Redis database
3. Copy the REST URL and Token

---

## Step 4: Deploy Backend to Render

### 4.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `agromarkethub-backend`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Environment Variables:**
Add the following environment variables:

**Note:** Render automatically sets the `PORT` environment variable. You don't need to set it manually, but your code should use `process.env.PORT || 5000`.

```env
# Server
NODE_ENV=production
# PORT is automatically set by Render - don't set manually

# MongoDB
MONGODB_URI=mongodb+srv://agromarkethub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agromarkethub?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
# OR if using Upstash:
# REDIS_URL=your-upstash-redis-url

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Service
EMAIL_SERVICE=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# M-Pesa (Daraja API)
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_ENVIRONMENT=production
MPESA_CALLBACK_URL=https://your-backend-url.onrender.com/api/v1/mpesa/callback

# AI Service URL (will be set after deploying AI service)
AI_SERVICE_URL=https://your-ai-service.onrender.com/api/v1

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
- The `MPESA_CALLBACK_URL` should point to your Render backend URL
- The `AI_SERVICE_URL` will be set after deploying the AI service

### 4.2 Deploy

1. Click "Create Web Service"
2. Render will start building and deploying
3. Wait for deployment to complete
4. Copy your backend URL: `https://agromarkethub-backend.onrender.com`

---

## Step 5: Deploy AI Service to Render

### 5.1 Create Web Service

1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect the same GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `agromarkethub-ai-service`
- **Region**: Same as backend
- **Branch**: `main`
- **Root Directory**: `ai-service`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Environment Variables:**
```env
# MongoDB
MONGODB_URI=mongodb+srv://agromarkethub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agromarkethub?retryWrites=true&w=majority
MONGODB_DB_NAME=agromarkethub

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Weather API
WEATHER_API_KEY=your-openweathermap-api-key

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-backend.onrender.com,http://localhost:3000
```

### 5.2 Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy your AI service URL: `https://agromarkethub-ai-service.onrender.com`

### 5.3 Update Backend Environment Variable

1. Go back to your backend service on Render
2. Update the `AI_SERVICE_URL` environment variable:
   ```
   AI_SERVICE_URL=https://agromarkethub-ai-service.onrender.com/api/v1
   ```
3. Save and redeploy

---

## Step 6: Deploy Frontend to Vercel

### 6.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:

**Project Settings:**
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Environment Variables:**
```env
# API URLs
VITE_API_URL=https://agromarkethub-backend.onrender.com/api/v1
VITE_AI_SERVICE_URL=https://agromarkethub-ai-service.onrender.com/api/v1

# Other frontend variables if needed
VITE_APP_NAME=AgroMarketHub
```

### 6.2 Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Copy your frontend URL: `https://your-project.vercel.app`

### 6.3 Update CORS Settings

1. Go back to Render backend service
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-project.vercel.app,http://localhost:3000
   ```
3. Go to Render AI service
4. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-project.vercel.app,https://agromarkethub-backend.onrender.com,http://localhost:3000
   ```
5. Redeploy both services

---

## Step 7: Configure M-Pesa Callback URL

### 7.1 Update M-Pesa Settings

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Navigate to your app settings
3. Update the callback URL to:
   ```
   https://agromarkethub-backend.onrender.com/api/v1/mpesa/callback
   ```
4. Save changes

### 7.2 Update Backend Environment

Ensure your backend has the correct M-Pesa callback URL in Render environment variables.

---

## Step 8: Post-Deployment Checklist

### 8.1 Test All Services

- [ ] Frontend loads correctly
- [ ] Backend API responds (check `/health` endpoint)
- [ ] AI service responds (check `/health` endpoint)
- [ ] User registration works
- [ ] User login works
- [ ] Product creation works
- [ ] Image upload works (Cloudinary)
- [ ] Order creation works
- [ ] M-Pesa payment flow works
- [ ] Email notifications work

### 8.2 Monitor Logs

**Render:**
- Go to your service → "Logs" tab
- Monitor for errors

**Vercel:**
- Go to your project → "Deployments" → Click deployment → "View Function Logs"

### 8.3 Set Up Custom Domains (Optional)

**Vercel:**
1. Go to project settings → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions

**Render:**
1. Go to service settings → "Custom Domains"
2. Add your custom domain
3. Update DNS records as instructed

---

## Step 9: Environment-Specific Configuration

### 9.1 Production vs Development

Create separate environment configurations:

**Development (Local):**
- Use local MongoDB
- Use local Redis
- Use development M-Pesa credentials

**Production (Deployed):**
- Use MongoDB Atlas
- Use Render Redis or Upstash
- Use production M-Pesa credentials

### 9.2 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT secrets** - Generate with: `openssl rand -base64 32`
3. **Enable HTTPS** - Vercel and Render provide this automatically
4. **Set up rate limiting** - Consider adding rate limiting middleware
5. **Monitor API usage** - Set up alerts for unusual activity

---

## Step 10: Troubleshooting

### Common Issues

#### Backend Not Starting
- Check build logs in Render
- Verify all environment variables are set
- Check MongoDB connection string format
- Ensure `PORT` environment variable is set (Render sets this automatically)

#### AI Service Not Starting
- Check Python version compatibility
- Verify all dependencies in `requirements.txt`
- Check Redis connection
- Verify MongoDB connection

#### Frontend Build Failing
- Check Vercel build logs
- Verify all environment variables start with `VITE_`
- Check for TypeScript errors
- Ensure build command is correct

#### CORS Errors
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check that URLs don't have trailing slashes
- Ensure backend CORS middleware is configured correctly

#### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user credentials
- Verify connection string format

#### Redis Connection Issues
- Verify Redis URL format
- Check if using internal vs external Redis URL
- For Render services, use internal Redis URL

---

## Step 11: Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Vercel**: Automatically deploys on push to main branch
- **Render**: Automatically deploys on push to main branch (can be configured)

### Manual Deployment

If you need to manually trigger a deployment:
- **Vercel**: Go to project → "Deployments" → "Redeploy"
- **Render**: Go to service → "Manual Deploy" → "Deploy latest commit"

---

## Step 12: Monitoring & Maintenance

### 12.1 Set Up Monitoring

**Render:**
- Built-in metrics dashboard
- Set up alerts for service downtime

**Vercel:**
- Built-in analytics
- Function logs for serverless functions

### 12.2 Regular Maintenance

1. **Update Dependencies**: Regularly update npm/pip packages
2. **Monitor Logs**: Check for errors regularly
3. **Database Backups**: MongoDB Atlas provides automatic backups
4. **Security Updates**: Keep dependencies updated

---

## Quick Reference: Service URLs

After deployment, you'll have:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://agromarkethub-backend.onrender.com`
- **AI Service**: `https://agromarkethub-ai-service.onrender.com`

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## Notes

1. **Free Tier Limitations**:
   - Render free tier services spin down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds
   - Consider upgrading to paid plan for production

2. **Environment Variables**:
   - Never commit sensitive data
   - Use Render/Vercel environment variable management
   - Rotate secrets regularly

3. **Database**:
   - MongoDB Atlas free tier has 512MB storage limit
   - Monitor usage in Atlas dashboard

4. **Redis**:
   - Render Redis free tier has 25MB limit
   - Upstash free tier has 10,000 commands/day limit

---

## Deployment Checklist Summary

- [ ] MongoDB Atlas cluster created and configured
- [ ] Redis instance created (Render or Upstash)
- [ ] Backend deployed to Render with all environment variables
- [ ] AI service deployed to Render with all environment variables
- [ ] Frontend deployed to Vercel with all environment variables
- [ ] CORS configured correctly
- [ ] M-Pesa callback URL updated
- [ ] All services tested and working
- [ ] Custom domains configured (optional)
- [ ] Monitoring set up

---

**Congratulations! Your AgroMarketHub application is now deployed! 🚀**

