# Google OAuth Setup Guide

## Issue: "Configuration" Error

If you're getting a "Configuration" error when trying to login with Google, follow these steps:

## 1. Environment Variables

Make sure you have these in your `.env` file:

```env
AUTH_SECRET="your-secret-key"
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

## 2. Google Cloud Console Setup

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Create or Select Project
1. Click on the project dropdown at the top
2. Create a new project or select existing one

### Step 3: Enable Google+ API
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click "Enable"

### Step 4: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required fields:
   - App name: CUBIS Academy
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Click "Save and Continue"
5. Skip "Scopes" (click "Save and Continue")
6. Add test users if needed
7. Click "Save and Continue"

### Step 5: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Name: CUBIS Academy Local
5. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
6. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click "Create"
8. Copy the Client ID and Client Secret

### Step 6: Update .env File
```env
AUTH_GOOGLE_ID=your-copied-client-id
AUTH_GOOGLE_SECRET=your-copied-client-secret
```

## 3. Restart Development Server

After updating .env, restart your Next.js server:

```bash
# Stop the server (Ctrl+C)
# Then restart
pnpm dev
```

## 4. Test Google Login

1. Go to http://localhost:3000/km/login
2. Click "Sign in with Google"
3. You should be redirected to Google's login page
4. After successful login, you'll be redirected back to your app

## Common Issues

### Issue: "redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in Google Console exactly matches:
```
http://localhost:3000/api/auth/callback/google
```

### Issue: "Access blocked: This app's request is invalid"
**Solution**: 
1. Check that Google+ API is enabled
2. Verify OAuth consent screen is configured
3. Make sure you're using the correct Client ID and Secret

### Issue: "fetch failed" or "Configuration" error
**Solution**:
1. Add `AUTH_URL=http://localhost:3000` to .env
2. Add `NEXTAUTH_URL=http://localhost:3000` to .env
3. Restart the dev server

### Issue: "This app isn't verified"
**Solution**: This is normal for development. Click "Advanced" > "Go to CUBIS Academy (unsafe)" to continue.

## Production Setup

For production, update the redirect URIs to your production domain:

```
Authorized JavaScript origins:
https://yourdomain.com

Authorized redirect URIs:
https://yourdomain.com/api/auth/callback/google
```

And update your .env:
```env
AUTH_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

## Troubleshooting

### Check Environment Variables
```bash
# In your terminal
echo $AUTH_URL
echo $AUTH_GOOGLE_ID
```

### Check Auth.js Configuration
The auth.ts file should have:
```typescript
Google({
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
})
```

### Check Logs
Look for errors in the terminal where your dev server is running.

### Clear Browser Cache
Sometimes cached OAuth data can cause issues. Clear your browser cache or use incognito mode.

## Need Help?

If you're still having issues:
1. Check the Auth.js documentation: https://authjs.dev/
2. Verify all environment variables are set correctly
3. Make sure Google Cloud Console settings match exactly
4. Try using a different browser or incognito mode
