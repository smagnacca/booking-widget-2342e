#!/bin/bash
# Automated token update script
# Usage: ./UPDATE_TOKEN_AUTOMATED.sh "your_new_refresh_token_here"

NETLIFY_TOKEN=$(cat ~/.claude/tokens/.netlify_token 2>/dev/null)
SITE_ID="206f206e-cbbc-4488-98f3-ff603428d072"
NEW_REFRESH_TOKEN="$1"

if [ -z "$NEW_REFRESH_TOKEN" ]; then
  echo "❌ Usage: ./UPDATE_TOKEN_AUTOMATED.sh 'your_new_refresh_token_here'"
  exit 1
fi

echo "Updating Google Refresh Token on Netlify..."
curl -s -X PUT \
  -H "Authorization: Bearer $NETLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"value\": \"$NEW_REFRESH_TOKEN\", \"context\": \"all\"}" \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/env/GOOGLE_REFRESH_TOKEN" | jq .

echo ""
echo "✓ Token updated! Netlify will rebuild automatically..."
echo "Wait 2-3 minutes, then test: https://book.scottmagnacca.com/api/availability?timezone=America/New_York"
