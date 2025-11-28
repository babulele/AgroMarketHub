# AgroMarketHub - Deployment Documentation

This repository contains comprehensive deployment guides for the AgroMarketHub application.

## 📚 Documentation Files

1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide
   - Detailed instructions for all services
   - Environment variable configuration
   - Troubleshooting guide
   - Best practices

2. **[DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)** - Quick reference guide
   - Condensed deployment steps
   - Essential environment variables
   - Common issues and solutions

3. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre and post-deployment checklist
   - Step-by-step verification
   - Testing procedures
   - Security checklist

## 🚀 Quick Deploy Summary

### Services
- **Frontend**: Vercel
- **Backend**: Render
- **AI Service**: Render

### Prerequisites
- MongoDB Atlas account
- Redis instance (Render or Upstash)
- Cloudinary account
- Gmail account (for email service)
- M-Pesa Daraja API credentials
- OpenWeatherMap API key

### Deployment Steps

1. **MongoDB Atlas Setup** (5 min)
   - Create cluster
   - Configure database user
   - Whitelist IPs

2. **Redis Setup** (2 min)
   - Create Redis instance on Render or Upstash

3. **Deploy Backend** (10 min)
   - Render → New Web Service
   - Connect GitHub repo
   - Configure environment variables

4. **Deploy AI Service** (10 min)
   - Render → New Web Service
   - Connect GitHub repo
   - Configure environment variables

5. **Deploy Frontend** (5 min)
   - Vercel → New Project
   - Connect GitHub repo
   - Configure environment variables

6. **Post-Deployment** (5 min)
   - Update CORS settings
   - Update M-Pesa callback URL
   - Test all services

**Total Time: ~40 minutes**

## 📋 Configuration Files

- `frontend/vercel.json` - Vercel deployment configuration
- `render.yaml` - Render Blueprint configuration (optional)

## 🔗 Service URLs

After deployment, you'll have:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://agromarkethub-backend.onrender.com`
- AI Service: `https://agromarkethub-ai-service.onrender.com`

## 📝 Environment Variables

### Backend (Render)
- MongoDB connection string
- JWT secret
- Redis credentials
- Cloudinary credentials
- Email service credentials
- M-Pesa API credentials
- AI service URL
- CORS allowed origins

### AI Service (Render)
- MongoDB connection string
- Redis credentials
- Weather API key
- CORS allowed origins

### Frontend (Vercel)
- Backend API URL
- AI service URL

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete list.

## 🧪 Testing

After deployment, test:
1. Health endpoints (`/health`)
2. User registration and login
3. Product creation (farmer)
4. Product browsing (buyer)
5. Order creation and payment
6. Image uploads
7. Email notifications

## 🆘 Troubleshooting

Common issues:
- **503 errors**: Service spinning up (free tier)
- **CORS errors**: Check `ALLOWED_ORIGINS`
- **Database connection**: Verify MongoDB IP whitelist
- **Build failures**: Check logs and environment variables

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/

## ⚠️ Important Notes

1. **Free Tier Limitations**:
   - Render services spin down after 15 min inactivity
   - First request may take 30-60 seconds
   - Consider paid plans for production

2. **Security**:
   - Never commit `.env` files
   - Use strong secrets
   - Enable HTTPS (automatic on Vercel/Render)

3. **Monitoring**:
   - Check service logs regularly
   - Monitor database usage
   - Set up error tracking

## 🎯 Next Steps

After deployment:
1. Set up custom domains (optional)
2. Configure monitoring and alerts
3. Set up database backups
4. Enable production M-Pesa credentials
5. Configure CI/CD pipelines

---

**For detailed instructions, start with [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**


