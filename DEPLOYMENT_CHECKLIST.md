# Deployment Checklist

Use this checklist to ensure all steps are completed before and after deployment.

## Pre-Deployment

### Infrastructure Setup
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB database user created
- [ ] MongoDB IP whitelist configured (0.0.0.0/0)
- [ ] Redis instance created (Render or Upstash)
- [ ] Cloudinary account created
- [ ] Gmail App Password generated
- [ ] M-Pesa Daraja API credentials obtained
- [ ] OpenWeatherMap API key obtained

### Code Preparation
- [ ] All code committed to GitHub
- [ ] `.env` files are NOT committed (check `.gitignore`)
- [ ] Build scripts verified in `package.json` files
- [ ] TypeScript compilation works locally
- [ ] Frontend build works locally (`npm run build`)
- [ ] Backend build works locally (`npm run build`)

### Environment Variables Documented
- [ ] Backend environment variables documented
- [ ] AI service environment variables documented
- [ ] Frontend environment variables documented

---

## Deployment Steps

### Backend Deployment (Render)
- [ ] Render account created
- [ ] New Web Service created for backend
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] Backend URL copied: `https://agromarkethub-backend.onrender.com`
- [ ] Health check passes: `/health` endpoint works

### AI Service Deployment (Render)
- [ ] New Web Service created for AI service
- [ ] Same GitHub repository connected
- [ ] Root directory set to `ai-service`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] AI service URL copied: `https://agromarkethub-ai-service.onrender.com`
- [ ] Health check passes: `/health` endpoint works

### Frontend Deployment (Vercel)
- [ ] Vercel account created
- [ ] New project created
- [ ] GitHub repository connected
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] All environment variables added (VITE_*)
- [ ] Project deployed successfully
- [ ] Frontend URL copied: `https://your-project.vercel.app`

### Post-Deployment Configuration
- [ ] Backend `AI_SERVICE_URL` updated
- [ ] Backend `ALLOWED_ORIGINS` updated with frontend URL
- [ ] AI service `ALLOWED_ORIGINS` updated with frontend URL
- [ ] Backend `MPESA_CALLBACK_URL` updated
- [ ] M-Pesa callback URL updated in Safaricom Developer Portal
- [ ] All services redeployed after CORS updates

---

## Testing Checklist

### Health Checks
- [ ] Backend health endpoint: `GET /health`
- [ ] AI service health endpoint: `GET /health`
- [ ] Frontend loads without errors

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT token generation works
- [ ] Protected routes require authentication

### Farmer Features
- [ ] Farmer can create account
- [ ] Farmer can upload ID
- [ ] Farmer can add farm location
- [ ] Farmer can create product listing
- [ ] Farmer can upload product images
- [ ] Farmer can view AI dashboard
- [ ] Farmer can view sales analytics

### Buyer Features
- [ ] Buyer can create account
- [ ] Buyer can browse products
- [ ] Buyer can view product details
- [ ] Buyer can add products to cart
- [ ] Buyer can checkout
- [ ] Buyer can make payment (M-Pesa)
- [ ] Buyer can view order history
- [ ] Buyer can leave reviews

### Admin Features
- [ ] Admin can login
- [ ] Admin can view farmer verification queue
- [ ] Admin can approve/reject farmers
- [ ] Admin can view disputes
- [ ] Admin can view analytics dashboard
- [ ] Admin can view big data visualizations

### Integrations
- [ ] Cloudinary image upload works
- [ ] Email notifications sent successfully
- [ ] M-Pesa payment flow works (sandbox)
- [ ] Redis caching works
- [ ] MongoDB connection stable

### Performance
- [ ] Page load times acceptable (< 3 seconds)
- [ ] API response times acceptable (< 1 second)
- [ ] Images load correctly
- [ ] No console errors in browser

---

## Security Checklist

- [ ] All `.env` files excluded from Git
- [ ] Strong JWT secret generated
- [ ] MongoDB connection string uses strong password
- [ ] CORS configured correctly (not `*`)
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Environment variables not exposed in client code
- [ ] API keys secured in environment variables
- [ ] Rate limiting considered (optional)

---

## Monitoring Setup

- [ ] Render service logs accessible
- [ ] Vercel deployment logs accessible
- [ ] Error tracking considered (Sentry, etc.)
- [ ] Uptime monitoring considered (UptimeRobot, etc.)
- [ ] Database monitoring enabled (MongoDB Atlas)

---

## Documentation

- [ ] Deployment guide created
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide created
- [ ] Team access configured

---

## Production Readiness

### Before Going Live
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Rollback plan prepared

### Production Configuration
- [ ] M-Pesa production credentials configured
- [ ] Production email service configured
- [ ] Custom domains configured (optional)
- [ ] SSL certificates verified
- [ ] Database backups enabled

---

## Post-Launch

### Week 1
- [ ] Monitor error logs daily
- [ ] Check service uptime
- [ ] Monitor database usage
- [ ] Review user feedback
- [ ] Check payment processing

### Month 1
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Update dependencies
- [ ] Security audit
- [ ] User feedback analysis

---

## Rollback Plan

If deployment fails:
1. [ ] Identify the failing service
2. [ ] Check deployment logs
3. [ ] Review environment variables
4. [ ] Fix issues in local environment first
5. [ ] Redeploy after fixes
6. [ ] Test thoroughly before next deployment

---

## Support Contacts

- **Render Support**: https://render.com/docs/support
- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://www.mongodb.com/support
- **Cloudinary Support**: https://support.cloudinary.com

---

## Notes

- Free tier services on Render may spin down after inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plans for production use
- Monitor usage limits on free tiers

---

**Last Updated**: [Date]
**Deployed By**: [Name]
**Deployment Date**: [Date]


