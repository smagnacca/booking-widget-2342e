#!/bin/bash
# Google OAuth2 Setup Helper — Automated + Interactive

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Google OAuth2 Setup for Booking Widget"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check if Google Cloud project exists
echo "Step 1: Google Cloud Project"
echo "───────────────────────────────"
echo "Go to: https://console.cloud.google.com"
echo "✓ Create a new project named 'booking-widget'"
echo "✓ Wait for it to be active"
echo ""
read -p "Press Enter when project is ready..."

# Step 2: Enable Calendar API
echo ""
echo "Step 2: Enable Google Calendar API"
echo "───────────────────────────────"
echo "In Google Cloud Console:"
echo "✓ Search for 'Google Calendar API'"
echo "✓ Click 'Enable'"
echo ""
read -p "Press Enter when Calendar API is enabled..."

# Step 3: Create OAuth2 Credentials
echo ""
echo "Step 3: Create OAuth2 Credentials"
echo "───────────────────────────────"
echo "In Google Cloud Console:"
echo "✓ Click 'Create Credentials' → 'OAuth client ID'"
echo "✓ Choose 'Desktop application'"
echo "✓ Name: 'booking-widget'"
echo "✓ Click 'Create'"
echo ""
read -p "Enter your Client ID: " CLIENT_ID
read -p "Enter your Client Secret: " CLIENT_SECRET

# Step 4: Get Refresh Token
echo ""
echo "Step 4: Get Refresh Token (One-time authentication)"
echo "───────────────────────────────"
echo "Installing dependencies..."
npm install --save google-auth-library googleapis 2>/dev/null || true

echo ""
echo "Opening Google authentication in your browser..."
echo ""

# Create temporary Node script to get refresh token
cat > /tmp/get-refresh-token.js << 'EOF'
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const readline = require('readline');
const http = require('http');

const CLIENT_ID = process.argv[2];
const CLIENT_SECRET = process.argv[3];
const REDIRECT_URL = 'http://localhost:3000/oauth2callback';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
  prompt: 'consent',
});

console.log('\n🔗 Opening Google authorization URL in your browser...\n');
console.log('If browser doesn\'t open, visit:', authUrl);
console.log('');

// Start local server to catch redirect
const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/oauth2callback')) {
    const url = new URL(req.url, 'http://localhost:3000');
    const authCode = url.searchParams.get('code');

    if (authCode) {
      try {
        const { tokens } = await oauth2Client.getToken(authCode);
        console.log('\n✅ SUCCESS! Copy your refresh token below:\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('REFRESH_TOKEN=' + tokens.refresh_token);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: sans-serif; margin: 40px; text-align: center;">
              <h2>✅ Authorization Successful!</h2>
              <p>Copy your refresh token from the terminal.</p>
              <p style="color: #666; font-size: 12px;">You can close this window.</p>
            </body>
          </html>
        `);
      } catch (err) {
        console.error('❌ Error:', err.message);
        res.writeHead(400);
        res.end('Error: ' + err.message);
      }
      server.close();
    }
  }
}).listen(3000);

// Open browser
const { exec } = require('child_process');
exec(`open "${authUrl}"`).on('error', () => {
  // If open fails on non-Mac, just show the URL
});
EOF

node /tmp/get-refresh-token.js "$CLIENT_ID" "$CLIENT_SECRET"
REFRESH_TOKEN=$(read -p "Paste your REFRESH_TOKEN value here: " REFRESH_TOKEN && echo $REFRESH_TOKEN)

rm -f /tmp/get-refresh-token.js

# Step 5: Save to .env
echo ""
echo "Step 5: Saving credentials to .env"
echo "───────────────────────────────"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ Created .env from .env.example"
fi

# Update .env with credentials (macOS compatible)
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$CLIENT_ID/" .env
  sed -i '' "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$CLIENT_SECRET/" .env
  sed -i '' "s/GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=$REFRESH_TOKEN/" .env
else
  sed -i "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$CLIENT_ID/" .env
  sed -i "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$CLIENT_SECRET/" .env
  sed -i "s/GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=$REFRESH_TOKEN/" .env
fi

echo "✓ Updated .env with credentials"
echo ""

# Verify
echo "Step 6: Verify credentials"
echo "───────────────────────────────"
echo "Checking .env..."
grep "GOOGLE_CLIENT_ID\|GOOGLE_CLIENT_SECRET\|GOOGLE_REFRESH_TOKEN" .env | head -3
echo ""
echo "✅ OAuth2 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Set up Resend: ./scripts/setup-resend.sh"
echo "2. Test locally: npm install && netlify dev"
echo "3. Deploy: netlify deploy --prod"
echo ""
