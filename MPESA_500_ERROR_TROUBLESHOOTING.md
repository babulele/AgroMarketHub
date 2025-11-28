# M-Pesa 500 Error Troubleshooting Guide

## Common Causes of 500 Errors

### 1. **Invalid Credentials**
- **Consumer Key/Secret**: Check if they're correct in `backend/.env`
- **Shortcode/Passkey**: Ensure they're swapped correctly (shortcode = numeric, passkey = hash string)

### 2. **M-Pesa API Authentication Failure**
- The access token generation might be failing
- Check backend logs for "M-Pesa token error"

### 3. **Invalid Request Format**
- Shortcode must be numeric (e.g., `174379`)
- Phone number must be in format `254712345678`
- Amount must be a whole number (rounded)

### 4. **Network/Connectivity Issues**
- Check if you can reach `https://sandbox.safaricom.co.ke`
- Firewall or proxy blocking the connection

### 5. **Callback URL Issues**
- Callback URL must be publicly accessible (ngrok is fine for development)
- Must be HTTPS
- Must return 200 OK response

## How to Diagnose

### Step 1: Check Backend Logs
Look for detailed error messages in your backend console:

```bash
# Start backend with verbose logging
cd backend
npm run dev
```

Look for:
- `M-Pesa token error:` - Authentication issue
- `M-Pesa STK Push error:` - Payment initiation issue
- `M-Pesa payment error:` - Route handler error

### Step 2: Verify Environment Variables
Run the check script:

```bash
cd backend
node check-env.js
```

Verify all M-Pesa variables are SET and have correct values.

### Step 3: Test M-Pesa API Connection
The improved error handling will now show:
- **401 errors**: Authentication failed (check consumer key/secret)
- **400 errors**: Invalid request (check shortcode, phone number, amount)
- **Network errors**: Connection issues (check internet/firewall)

### Step 4: Check Credentials Format

**Correct Format:**
```env
MPESA_SHORTCODE=174379                    # Numeric, 6 digits
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919  # Long hash string
MPESA_CONSUMER_KEY=YUqDkpRH6ajB9xoz28Jm6N5gWHeRgUxBMY2775kqqQ96tk4y
MPESA_CONSUMER_SECRET=ykLfwqrhSiYidxbOO0BKq1ydX1HNgGWlPaE2QZTKhIjTkwwlExGve0whEa6YZM37
```

**Common Mistakes:**
- ❌ Shortcode and passkey swapped
- ❌ Extra spaces or quotes in .env file
- ❌ Missing variables
- ❌ Wrong environment (sandbox vs production)

## Improved Error Messages

The code now provides more specific error messages:

1. **"M-Pesa authentication failed: Invalid consumer key or secret"**
   - Fix: Check `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET` in `.env`

2. **"Unable to connect to M-Pesa API"**
   - Fix: Check internet connection, firewall, or proxy settings

3. **"Invalid request to M-Pesa API"**
   - Fix: Check shortcode format, phone number format, amount

4. **"M-Pesa payment request failed"**
   - Fix: Check M-Pesa response code and description in logs

## Next Steps

1. **Restart the backend server** after fixing credentials
2. **Check the browser console** for the detailed error message
3. **Check backend logs** for the full error details
4. **Try the payment again** and review the new error message

## Testing with Mock Response

If M-Pesa is not configured, the system will return a mock response in development mode. This helps test the flow without actual M-Pesa integration.

## Still Having Issues?

1. Check the backend terminal for detailed error logs
2. Verify all environment variables are loaded correctly
3. Test M-Pesa API access manually (if possible)
4. Check ngrok tunnel is active (if using ngrok for callback)

