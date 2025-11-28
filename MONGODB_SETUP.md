# MongoDB Setup Guide

## Connection String Formats

### Local MongoDB

```env
MONGODB_URI=mongodb://localhost:27017/agromarkethub
```

**Requirements:**
- MongoDB must be installed and running locally
- Default port is 27017
- Database name: `agromarkethub`

**Start MongoDB:**
```bash
# Windows (if installed as service)
net start MongoDB

# Or using mongod directly
mongod --dbpath "C:\data\db"
```

### MongoDB Atlas (Cloud)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agromarkethub?retryWrites=true&w=majority
```

**Important Notes:**
1. **Replace placeholders:**
   - `username` - Your MongoDB Atlas username
   - `password` - Your MongoDB Atlas password (URL-encoded if special characters)
   - `cluster.mongodb.net` - Your actual cluster hostname
   - `agromarkethub` - Your database name

2. **URL Encoding:**
   - If your password contains special characters, encode them:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `%` becomes `%25`
   - `&` becomes `%26`
   - etc.

3. **Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs) OR your specific IP
   - Click "Add IP Address"

4. **Database User:**
   - Go to MongoDB Atlas → Database Access
   - Create a database user with read/write permissions
   - Use this username and password in connection string

## Common Connection Errors

### Error: "Server record does not share hostname with parent URI"

**Cause:** Invalid connection string format, usually with MongoDB Atlas.

**Solutions:**

1. **Check connection string format:**
   ```
   ✅ Correct: mongodb+srv://user:pass@cluster.mongodb.net/dbname
   ❌ Wrong: mongodb://user:pass@cluster.mongodb.net/dbname (missing +srv)
   ❌ Wrong: mongodb+srv://user:pass@cluster.mongodb.net/dbname (typo in hostname)
   ```

2. **Verify cluster hostname:**
   - Go to MongoDB Atlas → Clusters
   - Click "Connect" on your cluster
   - Copy the exact hostname from the connection string
   - It should look like: `cluster0.xxxxx.mongodb.net`

3. **Check for extra characters:**
   - Remove any trailing spaces
   - Remove any line breaks
   - Ensure no extra quotes around the connection string

4. **Test connection string:**
   ```bash
   # Test with mongosh (MongoDB Shell)
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/agromarkethub"
   ```

### Error: "Authentication failed"

**Solutions:**
1. Verify username and password are correct
2. Check database user has proper permissions
3. Ensure password is URL-encoded if it contains special characters
4. Verify database user exists in MongoDB Atlas

### Error: "Connection timeout"

**Solutions:**
1. Check your internet connection
2. Verify IP address is whitelisted in MongoDB Atlas Network Access
3. Check firewall settings
4. Try connecting from a different network

## Environment Variable Setup

1. **Copy example file:**
   ```bash
   cp backend/env.example backend/.env
   ```

2. **Edit `backend/.env`:**
   ```env
   MONGODB_URI=your-connection-string-here
   ```

3. **For MongoDB Atlas, use this format:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agromarkethub?retryWrites=true&w=majority
   ```

4. **For local MongoDB:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/agromarkethub
   ```

## Testing the Connection

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Look for success message:**
   ```
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running on port 5000
   ```

3. **If connection fails:**
   - Check the error message in the terminal
   - Verify your connection string format
   - Check MongoDB Atlas Network Access settings
   - Ensure MongoDB service is running (for local)

## Quick Troubleshooting Checklist

- [ ] Connection string format is correct
- [ ] Username and password are correct
- [ ] Password is URL-encoded if needed
- [ ] Cluster hostname is correct
- [ ] IP address is whitelisted (MongoDB Atlas)
- [ ] Database user has proper permissions
- [ ] MongoDB service is running (local)
- [ ] No extra spaces or characters in connection string
- [ ] `.env` file exists in `backend/` directory
- [ ] Environment variable is named `MONGODB_URI`

## Getting MongoDB Atlas Connection String

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Go to your cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Select "Node.js" and version
6. Copy the connection string
7. Replace `<password>` with your actual password
8. Replace `<dbname>` with `agromarkethub` (or your preferred database name)
9. Add query parameters: `?retryWrites=true&w=majority`

Example result:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/agromarkethub?retryWrites=true&w=majority
```

