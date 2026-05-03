#!/bin/bash
# Resend Email Setup Helper

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Resend Email Setup for Booking Widget"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Step 1: Create Resend Account"
echo "───────────────────────────────"
echo "Go to: https://resend.com"
echo "✓ Sign up with your email"
echo "✓ Verify email"
echo ""
read -p "Press Enter when Resend account is ready..."

echo ""
echo "Step 2: Create API Key"
echo "───────────────────────────────"
echo "In Resend dashboard:"
echo "✓ Click 'API Keys' (or Integrations)"
echo "✓ Click 'Create API Key'"
echo "✓ Copy the key"
echo ""
read -p "Paste your Resend API Key: " RESEND_API_KEY

# Update .env
if [ ! -f .env ]; then
  cp .env.example .env
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/RESEND_API_KEY=.*/RESEND_API_KEY=$RESEND_API_KEY/" .env
else
  sed -i "s/RESEND_API_KEY=.*/RESEND_API_KEY=$RESEND_API_KEY/" .env
fi

echo ""
echo "✓ Saved Resend API Key to .env"
echo ""

echo "Step 3: Email Configuration"
echo "───────────────────────────────"
echo "For testing: Use default sender (noreply@resend.dev)"
echo "For production: Set up custom domain in Resend:"
echo "  • Domain: book.scottmagnacca.com"
echo "  • Sender: bookings@book.scottmagnacca.com"
echo ""
echo "For now, testing uses: noreply@resend.dev"
echo ""

echo "✅ Resend Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Test locally: npm install && netlify dev"
echo "2. Deploy: netlify deploy --prod"
echo ""
