# Get New Google Refresh Token — 3 Minutes

## Why
The current refresh token is invalid (`invalid_grant` from Google). We need a fresh one.

## Steps

### 1. Go to Google Cloud Console
https://console.cloud.google.com/projects

### 2. Find your project (should have "booking-widget" or similar in name)
- Click on it
- Go to **APIs & Services** → **Credentials**

### 3. Look for your OAuth2 Client ID
- It should say "OAuth 2.0 Client IDs"
- Click the one named "booking-widget" or similar (type: Desktop application)
- Note the **Client ID** and **Client Secret** — you'll need these

### 4. Generate new refresh token (this requires ONE browser click)
Run this command in your terminal:

```bash
npx google-auth-cli --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
```

Replace YOUR_CLIENT_ID and YOUR_CLIENT_SECRET with the values from step 3.

### 5. Browser will open
- Click "Allow" when prompted (grants calendar access)
- You'll see a new refresh token displayed in your terminal
- Copy it

### 6. Provide the token to Claude

Paste the refresh token here and I'll update Netlify automatically.

---

**If you can't find your Client ID/Secret:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Look for "OAuth 2.0 Client IDs"
3. If empty, click **Create Credentials** → **OAuth 2.0 Client ID** → **Desktop Application**
4. Then follow steps 4-6 above
