# M-Pesa Environment Variables Setup Guide

## Common Issues and Solutions

### Issue: "M-Pesa consumer key and secret are required"

This error occurs when the M-Pesa environment variables are not being read correctly. Here are the most common causes:

## Step 1: Verify .env File Exists

1. **Check if `backend/.env` file exists:**
   ```bash
   cd backend
   ls -la .env  # Linux/Mac
   dir .env     # Windows
   ```

2. **If it doesn't exist, create it:**
   ```bash
   cd backend
   cp env.example .env
   ```

## Step 2: Check Variable Names (Case-Sensitive!)

The variable names must be **exactly** as shown below (case-sensitive):

```env
MPESA_CONSUMER_KEY=your-actual-consumer-key-here
MPESA_CONSUMER_SECRET=your-actual-consumer-secret-here
MPESA_SHORTCODE=your-shortcode-here
MPESA_PASSKEY=your-passkey-here
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=http://localhost:5000/api/v1/mpesa/callback
```

**Common mistakes:**
- ❌ `Mpesa_Consumer_Key` (wrong case)
- ❌ `MPESA_CONSUMER_KEY ` (trailing space)
- ❌ `MPESA_CONSUMER_KEY=` (empty value)
- ❌ `MPESA_CONSUMER_KEY = value` (spaces around =)
- ✅ `MPESA_CONSUMER_KEY=value` (correct)

## Step 3: Check for Quotes and Spaces

**❌ WRONG - Don't use quotes:**
```env
MPESA_CONSUMER_KEY="your-key-here"
MPESA_CONSUMER_SECRET='your-secret-here'
```

**❌ WRONG - No spaces around =:**
```env
MPESA_CONSUMER_KEY = your-key-here
MPESA_CONSUMER_SECRET = your-secret-here
```

**✅ CORRECT - No quotes, no spaces:**
```env
MPESA_CONSUMER_KEY=your-key-here
MPESA_CONSUMER_SECRET=your-secret-here
```

## Step 4: Verify File Location

The `.env` file **must** be in the `backend/` directory:

```
AgroMarketHub/
├── backend/
│   ├── .env          ← Must be here!
│   ├── env.example
│   ├── package.json
│   └── src/
└── frontend/
```

## Step 5: Check for Hidden Characters

Sometimes copying from a document or website can add hidden characters:

1. **Open `backend/.env` in a text editor**
2. **Check each line:**
   - No leading/trailing spaces
   - No special characters at the end
   - No BOM (Byte Order Mark) at the start of file

3. **Re-type the variable names if unsure**

## Step 6: Restart the Server

After making changes to `.env`, **always restart the backend server**:

1. Stop the server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend
   npm run dev
   ```

## Step 7: Debug Environment Variables

Add this temporary debug code to check if variables are being loaded:

In `backend/src/server.ts`, after `dotenv.config()`, add:
```typescript
console.log('M-Pesa Config Check:');
console.log('MPESA_CONSUMER_KEY:', process.env.MPESA_CONSUMER_KEY ? 'SET' : 'NOT SET');
console.log('MPESA_CONSUMER_SECRET:', process.env.MPESA_CONSUMER_SECRET ? 'SET' : 'NOT SET');
console.log('MPESA_SHORTCODE:', process.env.MPESA_SHORTCODE ? 'SET' : 'NOT SET');
console.log('MPESA_PASSKEY:', process.env.MPESA_PASSKEY ? 'SET' : 'NOT SET');
```

## Example .env File Format

Here's a complete example of how your `backend/.env` should look:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# MongoDB
MONGODB_URI=mongodb://localhost:27017/agromarkethub

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# M-Pesa Daraja API
MPESA_CONSUMER_KEY=YourActualConsumerKeyFromMpesa
MPESA_CONSUMER_SECRET=YourActualConsumerSecretFromMpesa
MPESA_SHORTCODE=174379
MPESA_PASSKEY=YourActualPasskeyFromMpesa
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=http://localhost:5000/api/v1/mpesa/callback

# Email Service (SMTP)
EMAIL_SERVICE=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@agromarkethub.com
EMAIL_PORT=587

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# CORS
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

## Quick Test

To verify your environment variables are loaded:

1. **Create a test file `backend/test-env.js`:**
   ```javascript
   require('dotenv').config();
   console.log('MPESA_CONSUMER_KEY:', process.env.MPESA_CONSUMER_KEY || 'NOT SET');
   console.log('MPESA_CONSUMER_SECRET:', process.env.MPESA_CONSUMER_SECRET ? 'SET (hidden)' : 'NOT SET');
   ```

2. **Run it:**
   ```bash
   cd backend
   node test-env.js
   ```

3. **If it shows "NOT SET", your .env file is not being read correctly.**

## Still Having Issues?

1. **Check file encoding:** Save `.env` as UTF-8 (no BOM)
2. **Check file permissions:** Ensure the file is readable
3. **Verify dotenv is installed:** `npm list dotenv` in backend directory
4. **Check server logs:** Look for the M-Pesa configuration log messages when server starts

## Getting M-Pesa Credentials

If you need to get M-Pesa Daraja API credentials:

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create an account
3. Create an app
4. Get your Consumer Key and Consumer Secret
5. Get your Shortcode and Passkey from your app settings

