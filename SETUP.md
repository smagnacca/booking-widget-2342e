# Setup Guide — Booking Widget

Complete these steps to get the booking widget live.

## 1. Google Cloud Console — OAuth2 Setup (15 min)

### 1a. Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click "Select a Project" → "New Project"
3. Name: `booking-widget`
4. Click "Create"

### 1b. Enable Google Calendar API

1. Search for "Google Calendar API" in the search bar
2. Click "Google Calendar API"
3. Click "Enable"

### 1c. Create OAuth2 Credentials

1. Click "Create Credentials" → "OAuth client ID"
2. Choose "Desktop application"
3. Name: `booking-widget`
4. Click "Create"
5. Copy `Client ID` and `Client Secret` (you'll need these)

### 1d. Generate Refresh Token

To get a refresh token, run this command (one-time, requires your Google account):

```bash
cd ~/Documents/Claude/Projects/booking-widget

# Install Google auth library
npm install google-auth-library

# Run this Node.js script to get refresh token:
node -e "
const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');

const oauth2Client = new OAuth2Client(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/oauth2callback'
);

// Generate URL to visit
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
});

console.log('Visit this URL to authorize:');
console.log(authUrl);
"
```

1. Visit the URL it prints
2. Authorize with your Google account (scott.magnacca1@gmail.com)
3. You'll be redirected to `http://localhost:3000/...?code=XXX`
4. Copy the `code=...` part
5. Run:

```bash
node -e "
const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');

const oauth2Client = new OAuth2Client(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/oauth2callback'
);

oauth2Client.getToken('YOUR_CODE', (err, token) => {
  if (err) return console.log('Error:', err);
  console.log('Refresh Token:', token.refresh_token);
});
"
```

6. Copy the `Refresh Token` value

### 1e. Create `.env` File

```bash
cp .env.example .env
```

Edit `.env`:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_CALENDAR_ID=scott.magnacca1@gmail.com
RESEND_API_KEY=your_resend_api_key_here
CONFIRMATION_EMAIL_FROM=bookings@book.scottmagnacca.com
```

---

## 2. Resend — Email Setup (5 min)

1. Go to https://resend.com
2. Sign up or log in
3. Click "API Keys" → "Create API Key"
4. Copy the key
5. Paste into `.env` as `RESEND_API_KEY`

For testing, you can use the default sender: `noreply@resend.dev`
For production, set up a custom domain (`bookings@book.scottmagnacca.com`) — Resend will guide you.

---

## 3. Local Testing (10 min)

```bash
cd ~/Documents/Claude/Projects/booking-widget

# Install dependencies
npm install

# Start local Netlify Functions server
netlify dev
```

Open http://localhost:8888 in your browser.

**Test checklist:**
- [ ] Page loads without errors
- [ ] Widget renders (light theme + dark theme)
- [ ] Click "Select a Time" — should load available slots
- [ ] Click a time slot — should show name/email form
- [ ] Enter name + email
- [ ] Click "Confirm Booking"
- [ ] Check browser console for errors
- [ ] Check your email for confirmation (may take 30 sec)
- [ ] Check Google Calendar (scott.magnacca1@gmail.com) — new event should appear

---

## 4. Netlify Deploy (10 min)

### 4a. Connect to Netlify

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Log in
netlify login

# Create new Netlify site
netlify init
# Choose: Deploy this folder → ./public
```

### 4b. Add Environment Variables

After site is created:

```bash
netlify env:set GOOGLE_CLIENT_ID "your_client_id"
netlify env:set GOOGLE_CLIENT_SECRET "your_client_secret"
netlify env:set GOOGLE_REFRESH_TOKEN "your_refresh_token"
netlify env:set GOOGLE_CALENDAR_ID "scott.magnacca1@gmail.com"
netlify env:set RESEND_API_KEY "your_resend_api_key"
netlify env:set CONFIRMATION_EMAIL_FROM "bookings@book.scottmagnacca.com"
```

Or via Netlify UI:
1. Go to your site on netlify.com
2. Site Settings → Environment variables
3. Add all 6 variables above

### 4c. Deploy

```bash
netlify deploy --prod
```

This will deploy to `https://booking-widget.netlify.app`

---

## 5. Custom Subdomain — DNS Setup (5 min)

### 5a. Create CNAME Record

In your domain registrar (whatever you use for scottmagnacca.com):

1. Create a new CNAME record:
   - **Name:** `book`
   - **Value:** `booking-widget.netlify.app`
   - **TTL:** 3600 (or default)

2. Save and wait 5-10 minutes for DNS to propagate

### 5b. Point Netlify to Custom Domain

1. Go to netlify.com → your site
2. Site Settings → Domain Management
3. Add custom domain: `book.scottmagnacca.com`
4. Netlify will check the CNAME record

---

## 6. Test Live (5 min)

```bash
# Test widget script loads
curl https://book.scottmagnacca.com/widget.js | head -20

# Test demo page
open https://book.scottmagnacca.com

# Test availability API
curl "https://book.scottmagnacca.com/api/availability?timezone=America/New_York&meetingType=30"
```

All three should work without errors.

---

## 7. Embed on Your Sites

Copy this code snippet to any page where you want the booking widget:

```html
<script src="https://book.scottmagnacca.com/widget.js"></script>

<div id="scott-booking-widget"
     data-type="30"
     data-theme="dark"
     data-source="salesforlife">
</div>
```

Customize:
- `data-type="15"` or `data-type="30"` for meeting duration
- `data-theme="light"` or `data-theme="dark"` for theme
- `data-source="salesforlife"` to track which page generated the booking

---

## Troubleshooting

**"No availability slots found"**
- Check Google Calendar (scott.magnacca1@gmail.com) for existing events
- Ensure your calendar has open slots (9 AM - 5 PM, weekdays)

**"Failed to send confirmation email"**
- Check RESEND_API_KEY is correct
- Check CONFIRMATION_EMAIL_FROM is valid (or use default `noreply@resend.dev`)
- Check spam folder

**"OAuth error"**
- Verify GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN are correct
- Check Google Cloud Console project is active

**Widget doesn't load**
- Check browser console for CORS errors
- Verify custom domain DNS is set correctly: `dig book.scottmagnacca.com`
- Check Netlify deploy log for errors

---

## Next Steps

Once live:
1. Test embed on scott-magnacca.com
2. Test embed on salesforlife.ai
3. Share widget code with other sites
4. Monitor bookings in Google Calendar
5. Move to Phase 2: themes, meeting type config, timezone selector

