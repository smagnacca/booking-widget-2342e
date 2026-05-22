# Booking Widget — Scott's Calendar Booking System

## What It Does
Embeddable calendar booking widget that:
- Lets website visitors book time on your calendar
- Pulls availability from your Google Calendar
- Creates events automatically + sends confirmation emails
- Works on mobile, tablet, desktop
- Zero monthly fees (uses your own Google Calendar + Resend)

## Current Status
✅ Code deployed to book.scottmagnacca.com  
✅ Environment configured on Netlify  
❌ **BLOCKED:** Google refresh token is invalid (`invalid_grant`)

## How It Works
1. **Frontend:** `public/widget.js` — embeddable script that visitors load
2. **Backend:** `netlify/functions/availability.ts` + `book.ts` — Netlify Functions (serverless)
3. **Integration:** Google Calendar (read availability) + Resend (send emails)

## How to Embed
```html
<script src="https://book.scottmagnacca.com/widget.js"></script>
<div id="scott-booking-widget" data-type="30" data-theme="dark" data-source="salesforlife"></div>
```

## Environment Setup
**Location:** Netlify Site `book.scottmagnacca.com` (ID: 206f206e-cbbc-4488-98f3-ff603428d072)

**Required variables (all set except refresh token):**
- `GOOGLE_CLIENT_ID` ✓
- `GOOGLE_CLIENT_SECRET` ✓
- `GOOGLE_REFRESH_TOKEN` ❌ **INVALID** — needs regeneration
- `GOOGLE_CALENDAR_ID` ✓ (scott.magnacca1@gmail.com)
- `RESEND_API_KEY` ✓

## Fix in Progress
See `GET_GOOGLE_REFRESH_TOKEN.md` for 3-minute token regeneration process.

## Key Files
- `netlify/functions/availability.ts` — GET /api/availability (returns free slots)
- `netlify/functions/book.ts` — POST /api/book (creates calendar event + sends email)
- `public/widget.js` — Embeddable widget code
- `public/index.html` — Demo page at book.scottmagnacca.com
- `netlify.toml` — Build config + redirects
- `package.json` — Dependencies (googleapis, resend)

## Deployment
Push to main → Netlify auto-builds → live at book.scottmagnacca.com

## Next Steps
1. Get new Google refresh token (see GET_GOOGLE_REFRESH_TOKEN.md)
2. Update Netlify environment
3. Trigger rebuild
4. Verify API works
