#!/bin/bash
# Local Testing Helper

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Local Testing — Booking Widget"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check .env exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found"
  echo "Please run: ./scripts/setup-oauth2.sh && ./scripts/setup-resend.sh"
  exit 1
fi

# Check required credentials
echo "Checking credentials..."
if ! grep -q "GOOGLE_CLIENT_ID=" .env || ! grep -q "^GOOGLE_CLIENT_ID=[^=]*$" .env; then
  echo "❌ Missing GOOGLE_CLIENT_ID"
  exit 1
fi

echo "✓ Credentials found"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install --quiet
echo "✓ Dependencies installed"
echo ""

# Start Netlify dev server
echo "Starting local dev server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Server running at: http://localhost:8888"
echo ""
echo "Testing checklist:"
echo "  ✓ Open http://localhost:8888"
echo "  ✓ See light + dark theme widgets"
echo "  ✓ Click 'Select a Time' → slots should load"
echo "  ✓ Select a time → name/email form appears"
echo "  ✓ Enter name + email → click 'Confirm'"
echo "  ✓ Check email inbox for confirmation"
echo "  ✓ Check Google Calendar for new event"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

netlify dev
