#!/bin/bash
# Netlify Deploy Helper

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Deploy to Netlify — Booking Widget"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
  echo "Installing Netlify CLI..."
  npm install -g netlify-cli
fi

# Check .env
if [ ! -f .env ]; then
  echo "❌ Error: .env not found"
  echo "Run setup scripts first: ./scripts/setup-oauth2.sh && ./scripts/setup-resend.sh"
  exit 1
fi

# Check if logged in
if ! netlify status 2>/dev/null | grep -q "Logged in"; then
  echo "Step 1: Netlify Login"
  echo "───────────────────────────────"
  echo "Opening Netlify login in browser..."
  netlify login
fi

echo ""
echo "Step 2: Create/Link Netlify Site"
echo "───────────────────────────────"
read -p "Has this project been initialized with Netlify? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Initializing Netlify project..."
  netlify init
else
  echo "✓ Using existing Netlify site"
fi

echo ""
echo "Step 3: Set Environment Variables"
echo "───────────────────────────────"

# Read from .env and set in Netlify
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue

  # Only set specific variables
  case "$key" in
    GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GOOGLE_REFRESH_TOKEN|GOOGLE_CALENDAR_ID|RESEND_API_KEY|CONFIRMATION_EMAIL_FROM)
      echo "Setting $key..."
      netlify env:set "$key" "$value"
      ;;
  esac
done < .env

echo "✓ Environment variables set"
echo ""

echo "Step 4: Deploy to Netlify"
echo "───────────────────────────────"
echo "Deploying to production..."
netlify deploy --prod

echo ""
echo "✅ Deploy Complete!"
echo ""
echo "Next steps:"
echo "1. Go to your Netlify site dashboard"
echo "2. Copy the deploy URL (or use your custom domain)"
echo "3. Set up DNS for book.scottmagnacca.com:"
echo "   - Create CNAME: book → [your-netlify-site].netlify.app"
echo ""
echo "Test:"
echo "  curl https://book.scottmagnacca.com/api/availability?timezone=America/New_York&meetingType=30"
echo ""
