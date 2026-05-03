# CLAUDE.md — Booking Widget

> Read this file at the start of every session before doing anything else.

---

## PROJECT INFO

| Field | Value |
|---|---|
| **Project name** | booking-widget (Self-hosted calendar booking widget) |
| **Local Mac path** | `~/Documents/Claude/Projects/booking-widget/` |
| **GitHub repo** | (Not yet created — will be set up after Phase 1 verification) |
| **Netlify site** | booking-widget.netlify.app (to be created) |
| **Live URL** | https://book.scottmagnacca.com (custom subdomain) |
| **Branch** | main |
| **Deploy method** | Manual: `netlify deploy --prod` (during Phase 1 testing) |

---

## CURRENT PHASE

**Phase 1 — Core Widget (IN PROGRESS)**
- [x] Project structure created
- [x] Netlify Functions: availability.ts + book.ts
- [x] Widget embed script: widget.js
- [x] Demo page: index.html
- [ ] Google OAuth2 setup (needs Scott's action)
- [ ] Netlify deployment
- [ ] End-to-end testing

**What's Built:**
- Date/time picker with 7-day lookahead
- 15-min and 30-min meeting type support
- Visitor name/email form
- Google Calendar integration (availability + booking)
- Confirmation email via Resend
- Light/dark theme support
- Source tagging (tracks which page generated booking)

**What's NOT in Phase 1:**
- 60-min meetings (Phase 2)
- Admin dashboard (Phase 3)
- Stripe payments (Phase 3)
- Timezone selection UI (auto-detect only)
- Daily booking limits or buffer time
- Post-booking email sequences

---

## SETUP CHECKLIST (BEFORE DEPLOYMENT)

Scott must complete these steps once, then we deploy:

### 1. Google Cloud Console — OAuth2 Credentials
- [ ] Go to https://console.cloud.google.com
- [ ] Create a new project called "booking-widget"
- [ ] Enable Google Calendar API
- [ ] Create OAuth2 credentials (Desktop app)
- [ ] Generate a refresh token (requires Scott to authenticate once)
- [ ] Copy to `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

**Reference:** `SETUP-OAUTH2.md` (to be created)

### 2. Netlify Account Setup
- [ ] Create Netlify site: `booking-widget.netlify.app`
- [ ] Connect GitHub repo (or use manual deploy)
- [ ] Add env vars to Netlify: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `RESEND_API_KEY`

### 3. DNS — Custom Subdomain
- [ ] Create CNAME record: `book.scottmagnacca.com` → `booking-widget.netlify.app`
- [ ] Wait for DNS propagation (~5 min)
- [ ] Test: `curl https://book.scottmagnacca.com/widget.js`

### 4. Resend API Key
- [ ] Log in to Resend
- [ ] Create API key (or use existing)
- [ ] Copy to Netlify env: `RESEND_API_KEY`
- [ ] Verify sender domain: `bookings@book.scottmagnacca.com` (or use `noreply@resend.dev` for testing)

---

## LOCAL TESTING (Before Netlify Deploy)

```bash
cd ~/Documents/Claude/Projects/booking-widget

# Install dependencies
npm install

# Copy .env.example → .env, fill in values
cp .env.example .env
# Edit .env with real Google OAuth2 credentials

# Start local Netlify Functions server
netlify dev

# Open http://localhost:8888 → should see demo page with widgets
```

---

## VERIFICATION CHECKLIST (Phase 1 Complete)

- [ ] OAuth2 flow works (Google Calendar access granted)
- [ ] Availability endpoint returns free slots (test at /api/availability?timezone=America/New_York&meetingType=30)
- [ ] Book endpoint creates events in Google Calendar (check calendar.google.com)
- [ ] Confirmation emails arrive in visitor inbox
- [ ] Widget embeds on test page (http://localhost:8888)
- [ ] Light theme renders correctly
- [ ] Dark theme renders correctly
- [ ] Responsive design: works on mobile (iPhone 12 size)
- [ ] No console errors in browser DevTools

---

## FILE STRUCTURE

```
booking-widget/
├── netlify/
│   └── functions/
│       ├── availability.ts    # GET /api/availability
│       └── book.ts            # POST /api/book
├── public/
│   ├── widget.js              # Embeddable script
│   ├── index.html             # Demo + testing page
│   └── widget.css             # (embedded in widget.js)
├── .env.example               # Template
├── package.json
├── netlify.toml               # Netlify config
├── CLAUDE.md                  # This file
├── SETUP-OAUTH2.md            # Google OAuth2 step-by-step
├── SETUP.md                   # Full setup guide
├── README.md                  # Public docs
└── .git/                      # Version control
```

---

## TECH STACK

- **Frontend:** Vanilla JavaScript (no frameworks)
- **Backend:** Netlify Functions (Node.js 18)
- **Calendar:** Google Calendar API v3
- **Email:** Resend
- **Hosting:** Netlify
- **Auth:** Google OAuth2 (refresh token flow)

---

## KNOWN LIMITATIONS (Phase 1)

1. **No timezone selection UI** — Auto-detects from browser. Can force timezone in Phase 2.
2. **No daily booking limits** — Anyone can book unlimited slots. Add in Phase 2.
3. **No buffer time between meetings** — Bookings can be back-to-back. Add in Phase 2.
4. **No admin dashboard** — Can't cancel/reschedule. Add in Phase 3.
5. **One meeting type per embed** — Each widget shows only 15-min or 30-min (not mixed). Fix in Phase 2.
6. **iCloud sync manual** — Requires user to enable iCloud ↔ Google Calendar sync on iPhone. This is intentional (avoids CalDAV complexity).

---

## NEXT STEPS (After Phase 1 Live)

**Phase 2 — Polish (separate session):**
- Meeting type configuration (15/30/60-min options in one widget)
- Theme system (babson, salesforlife, default)
- Timezone selector UI
- Source tracking improvements
- Daily booking limit + buffer time
- Email template customization

**Phase 3 — Advanced (future):**
- Post-booking webhook → email sequence trigger
- Stripe payment at booking
- Admin dashboard (view/cancel bookings)
- Multi-calendar conflict check

---

## SESSION START

1. Read this file ✓
2. Check `.env` has valid credentials
3. Run `netlify dev` to test locally
4. Run verification checklist above

## SESSION END

1. Commit all changes: `git add . && git commit -m "..."`
2. Push to remote (once GitHub repo created)
3. Deploy to Netlify: `netlify deploy --prod`
4. Verify live: `curl https://book.scottmagnacca.com/widget.js`
5. Test on scott-magnacca.com (embed test page)
