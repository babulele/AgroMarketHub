# Cloudinary Setup Guide

## What is Cloudinary?

Cloudinary is a cloud-based image and video management service that provides:
- Image upload and storage
- Automatic image optimization
- Image transformations (resize, crop, format conversion)
- CDN delivery for fast loading
- Free tier with generous limits

## Getting Cloudinary Credentials

### Step 1: Sign Up for Cloudinary

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account (no credit card required)
3. Verify your email address

### Step 2: Get Your Credentials

After signing up, you'll be taken to your dashboard. You'll find your credentials in the **Dashboard** section:

1. **Cloud Name**: Found at the top of your dashboard
   - Example: `demo` or `your-company-name`

2. **API Key**: Found in the "Account Details" section
   - Click "Reveal" to see it

3. **API Secret**: Found in the "Account Details" section
   - Click "Reveal" to see it
   - ⚠️ Keep this secret secure!

### Step 3: Configure in Backend

Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=agromarkethub
```

## Free Tier Limits

Cloudinary's free tier includes:
- **25 GB storage**
- **25 GB monthly bandwidth**
- **25 million monthly transformations**
- Unlimited uploads

This is more than enough for development and small to medium production use.

## Features Used in AgroMarketHub

- **Automatic image optimization**: Images are automatically optimized for web
- **CDN delivery**: Fast global image delivery
- **Secure URLs**: Images are served over HTTPS
- **Folder organization**: Images are organized in folders (products, uploads, etc.)
- **Unique filenames**: Prevents filename conflicts

## Local Storage Fallback

If Cloudinary credentials are not configured, the system automatically falls back to local file storage in the `backend/uploads/` directory. This is useful for:
- Development without Cloudinary account
- Testing
- Offline development

## Production Recommendations

For production:
1. Use Cloudinary for better performance and scalability
2. Set up a dedicated Cloudinary account (not free tier)
3. Configure upload presets for different image types
4. Set up automatic backups
5. Monitor usage in Cloudinary dashboard

## Troubleshooting

### Images not uploading
- Check that all three credentials are set correctly
- Verify credentials in Cloudinary dashboard
- Check file size limits (default: 5MB)

### Images not displaying
- Verify CLOUDINARY_CLOUD_NAME is correct
- Check that images are being uploaded successfully
- Review Cloudinary dashboard for uploaded assets

### Need help?
- Cloudinary Documentation: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com/

