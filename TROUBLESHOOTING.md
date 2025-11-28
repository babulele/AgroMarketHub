# Troubleshooting Guide

## Backend Connection Issues

### ERR_CONNECTION_REFUSED

**Symptom:** 
- `POST http://localhost:5000/api/v1/upload/multiple net::ERR_CONNECTION_REFUSED`
- `POST http://localhost:5000/api/v1/orders net::ERR_CONNECTION_REFUSED`
- `POST http://localhost:5000/api/v1/mpesa/payment net::ERR_CONNECTION_REFUSED`
- Any API call returning `ERR_CONNECTION_REFUSED`

**Root Cause:** The backend server is not running or not accessible.

**Solution:**

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify the server is running:**
   - Check the terminal for: `Server running on port 5000`
   - Open browser: `http://localhost:5000/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Check environment variables:**
   - Ensure `backend/.env` exists
   - Verify `PORT=5000` (or your configured port)
   - Verify `MONGODB_URI` is set
   - Verify `JWT_SECRET` is set

4. **Check for port conflicts:**
   - Ensure port 5000 is not used by another application
   - Change port in `.env` if needed: `PORT=5001`

5. **Verify frontend API URL:**
   - Check `frontend/.env` or `frontend/.env.local`
   - Ensure `VITE_API_URL=http://localhost:5000/api/v1` matches your backend port

### Common Issues

**Issue:** Backend starts but immediately crashes
- Check MongoDB connection
- Verify all environment variables are set
- Check for TypeScript compilation errors: `npm run build`

**Issue:** Backend runs but routes return 404
- Verify route registration in `backend/src/routes/index.ts`
- Check API version matches: `/api/v1/`
- Verify route paths match frontend calls

**Issue:** Upload fails with authentication error
- Ensure user is logged in
- Check JWT token in localStorage
- Verify token hasn't expired
- Check user role (FARMER role required for `/upload/multiple`)

**Issue:** M-Pesa payment returns 500 error
- Check if M-Pesa credentials are configured in `backend/.env`
- In development, the endpoint will return a mock response if credentials are missing
- Verify `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY` are set
- Check backend logs for specific M-Pesa API errors
- Ensure phone number format is correct (254XXXXXXXXX)

**Issue:** Order creation fails
- Ensure backend server is running
- Verify MongoDB connection is working
- Check that products exist and have available inventory
- Verify user is authenticated and has BUYER role

