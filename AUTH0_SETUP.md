# Auth0 Setup Instructions

## What You Need to Configure in Auth0

### 1. Allow Popup/Modal Login

- Go to your Auth0 Dashboard
- Navigate to **Applications** > Your Application
- Under **Advanced Settings** > **OAuth**
- Enable **"OIDC Conformant"** (should already be enabled)
- Scroll down to **Allowed Callback URLs**
- Make sure you have these URLs (add if missing):
  - `http://localhost:5173` (your Vite dev server)
  - Add your production URL if you have one

### 2. Update Application Settings

The application should use:

- **Application Type**: Single Page Application (SPA)
- **Token Endpoint Authentication**: None (for SPA)

### 3. Environment Variables

Create a `.env` file in the root of your project:

```env
VITE_APP_AUTH0_DEV_DOMAIN=your-dev-domain.auth0.com
VITE_APP_AUTH0_CLIENT_ID=your-client-id-here
VITE_APP_AUDIENCE=your-api-identifier
VITE_APP_PRODUCTION_SERVER_URL=https://your-api-url.com
```

**Where to find these values:**

1. **VITE_AUTH0_DOMAIN**:

   - Auth0 Dashboard → Settings
   - Look for "Domain" field
   - Example: `your-app.auth0.com`

2. **VITE_AUTH0_CLIENT_ID**:

   - Auth0 Dashboard → Applications → Your App
   - Look for "Client ID" field

3. **VITE_AUTH0_AUDIENCE**:
   - This is your API Identifier
   - Auth0 Dashboard → Applications → APIs → Your API
   - Example: `https://belovedzguard-ebf890192e0e.herokuapp.com/api` or whatever you set for your API audience

### Important Notes

- **Port Change**: Your app runs on `localhost:5173` (not 3000), so make sure that's in your Allowed Callback URLs
- **Modal Login**: The app uses `loginWithPopup()` which opens a modal instead of redirecting the whole page
- **Automatic Token Refresh**: Auth0 SDK handles token refresh automatically

### If You Only Use Locally

You still need to configure Auth0 with:

1. The callback URL: `http://localhost:5173`
2. Your credentials in the `.env` file

The modal login will work fine locally!
