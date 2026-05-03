# Booking Widget — Self-Hosted Calendar Booking

A lightweight, zero-cost alternative to Calendly. Embed in any website with a single `<script>` tag.

**Features:**
- 📅 Reads availability from Google Calendar
- 🎨 Light/dark themes
- 📱 Mobile responsive
- 🔗 Single-line embed
- 📊 Source tracking (knows which page generated each booking)
- ✉️ Confirmation emails via Resend
- 🎥 Google Meet integration
- ⚡ Fast (Netlify Functions, <500ms response)

**Live demo:** https://book.scottmagnacca.com

---

## Quick Start

### 1. Embed on Your Site

```html
<script src="https://book.scottmagnacca.com/widget.js"></script>

<div id="scott-booking-widget"
     data-type="30"
     data-theme="dark"
     data-source="your-site">
</div>
```

That's it! The widget will:
1. Load available slots from Google Calendar
2. Let visitors select a time
3. Create calendar event + send confirmation email

### 2. Customize

**Meeting duration:**
```html
data-type="15"  <!-- 15-minute meetings -->
data-type="30"  <!-- 30-minute meetings (default) -->
```

**Theme:**
```html
data-theme="light"  <!-- Light background (default) -->
data-theme="dark"   <!-- Dark background -->
```

**Source tracking:**
```html
data-source="salesforlife"    <!-- Tracks which site generated booking -->
data-source="60-second-quiz"
data-source="babson"
```

---

## Setup

See `SETUP.md` for complete setup instructions (Google OAuth2, Resend, Netlify, DNS).

**TL;DR:**
1. Create Google Cloud project + enable Calendar API
2. Generate OAuth2 credentials (refresh token)
3. Sign up for Resend (free email)
4. Deploy to Netlify
5. Point custom subdomain DNS
6. Embed on your sites

---

## API Endpoints

### GET `/api/availability`

Returns available time slots.

**Query params:**
- `timezone` — IANA timezone (e.g., `America/New_York`, `Europe/London`)
- `meetingType` — `15` or `30` (minutes)

**Example:**
```bash
curl "https://book.scottmagnacca.com/api/availability?timezone=America/New_York&meetingType=30"
```

**Response:**
```json
{
  "slots": [
    {
      "date": "2026-05-06",
      "time": "2:00 PM",
      "isoTime": "2026-05-06T14:00:00-04:00"
    }
  ],
  "timezone": "America/New_York",
  "nextAvailable": "2026-05-06T14:00:00-04:00"
}
```

### POST `/api/book`

Create a new booking.

**Body:**
```json
{
  "startTime": "2026-05-06T14:00:00-04:00",
  "endTime": "2026-05-06T14:30:00-04:00",
  "visitorName": "John Doe",
  "visitorEmail": "john@example.com",
  "meetingType": "30",
  "source": "salesforlife",
  "timezone": "America/New_York"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "abc123def456",
  "confirmationUrl": "https://calendar.google.com/calendar/u/0/r/eventedit/abc123def456"
}
```

---

## How It Works

1. **Visitor lands on page** → Widget loads and fetches available slots from Google Calendar
2. **Visitor selects time** → Widget shows name/email form
3. **Visitor enters details** → Widget sends booking to Netlify Function
4. **Backend creates event** → Event appears in Google Calendar + Google Meet link generated
5. **Email sent** → Confirmation with meeting details + calendar invite

All encrypted, OAuth2-secured, and hosted on Netlify (serverless).

---

## Architecture

```
┌─ booking-widget.netlify.app ─────────┐
│ /widget.js (embed script)             │
│ /api/availability (Netlify Function)  │
│ /api/book (Netlify Function)          │
└─────────────────────────────────────────┘
           ↓
    [Google Calendar API]
           ↓
    scott.magnacca1@gmail.com
           ↓
    [iCloud Calendar] (via Google sync)
```

---

## File Structure

```
booking-widget/
├── public/
│   ├── widget.js          # Embeddable script (IIFE, scoped CSS)
│   └── index.html         # Demo page + testing
├── netlify/
│   └── functions/
│       ├── availability.ts # GET /api/availability
│       └── book.ts        # POST /api/book
├── .env.example           # Credentials template
├── netlify.toml           # Netlify config
├── package.json
└── SETUP.md               # Setup guide
```

---

## Configuration

### Environment Variables

```bash
# Google OAuth2 (from Google Cloud Console)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...

# Calendar
GOOGLE_CALENDAR_ID=scott.magnacca1@gmail.com
CALENDAR_TIMEZONE=America/New_York

# Email (Resend)
RESEND_API_KEY=...
CONFIRMATION_EMAIL_FROM=bookings@book.scottmagnacca.com

# Widget
WIDGET_HOST=https://book.scottmagnacca.com
MAX_ADVANCE_DAYS=30
BOOKING_BUFFER_MINUTES=15  # (Phase 2)
```

---

## Features

### Phase 1 (Current)
- ✅ Google Calendar integration (read/write)
- ✅ 15-min + 30-min meetings
- ✅ Auto-detect visitor timezone
- ✅ Light/dark theme
- ✅ Source tracking
- ✅ Confirmation emails
- ✅ Google Meet auto-generation
- ✅ Mobile responsive

### Phase 2 (Planned)
- [ ] 60-min meetings
- [ ] Theme customization (Babson, SalesForLife)
- [ ] Meeting type selector (15/30/60 in one widget)
- [ ] Timezone selector UI
- [ ] Daily booking limits
- [ ] Buffer time between meetings
- [ ] Email template customization

### Phase 3 (Future)
- [ ] Post-booking email sequences (Resend)
- [ ] Stripe payment
- [ ] Admin dashboard
- [ ] Booking cancellation/rescheduling
- [ ] Multi-calendar conflict check

---

## Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance

- Widget load time: <500ms
- Availability API: <1s
- Booking API: <2s
- No external dependencies (pure JS, no jQuery)
- CORS enabled for cross-origin embeds

---

## Privacy & Security

- OAuth2 refresh token stored securely on Netlify (server-side)
- Client ID/Secret never exposed to browser
- Booking data encrypted in transit (HTTPS)
- Google Calendar API handles access control
- Visitor emails stored only in Google Calendar event + Resend (as per email spec)

---

## License

MIT — free to use, modify, and redistribute.

---

## Support

See `SETUP.md` for troubleshooting.

Questions? Check the inline code comments in `widget.js` and the Netlify Functions.

---

**Made with ☀️ by Scott Magnacca**
