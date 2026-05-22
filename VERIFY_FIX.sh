#!/bin/bash
# Test if the widget is working
echo "Testing API endpoint..."
RESULT=$(curl -s "https://book.scottmagnacca.com/api/availability?timezone=America/New_York&meetingType=30" | jq -r '.slots[0].time // .error')
if [[ "$RESULT" == *"invalid_grant"* ]]; then
  echo "❌ Still broken: $RESULT"
  exit 1
else
  echo "✅ Working! Found time slot: $RESULT"
  exit 0
fi
