# Changelog — Booking Widget

## [May 3, 2026] Deployment Attempt #1 — OAuth Configuration Blocker

**Status:** 90% complete; blocked on Google OAuth test user configuration  
**Commits:** 0e7e680 (no new commits this session)  
**Time spent:** ~90 minutes

### ✅ Completed
- Reviewed full project structure (README, DEPLOY-GUIDE, CLAUDE.md)
- Confirmed Netlify deployment architecture and GitHub integration
- Created Google Cloud project "booking-widget" with Calendar API enabled
- Obtained OAuth 2.0 credentials:
  - Client ID: `[REDACTED_CLIENT_ID]`
  - Client Secret: `[REDACTED_CLIENT_SECRET]`
- Deployed to Netlify via "Deploy with Netlify" button
  - Site: `cheery-buttercream-a392fb.netlify.app`
  - Auto-builds on push to main via GitHub Action
- Obtained Resend API key for email confirmations
- Created Node.js OAuth token retrieval script (`get-token.mjs`)
- Documented pickup prompt and lessons learned

### ❌ Blocked On
**Google OAuth Verification Requirement:**
- OAuth consent screen is in "External" (test) mode
- Google is blocking authorization: "Error 403: access_denied"
- Root cause: `scott.magnacca1@gmail.com` not added as test user in OAuth consent screen
- Fix: Add email as test user in Google Cloud Console (1 click)
- Once fixed: Run `node get-token.mjs` → get refresh token → set Netlify env vars → done

### 📚 Lessons Learned
1. **OAuth flows are tricky to automate** — Custom Node.js server approach failed due to module/port issues; consider Playwright or manual URL-based approach next time
2. **Google test user requirement often missed** — "Error 403: access_denied" message doesn't explicitly say "add as test user"; had to infer
3. **One-click fixes deserve investigation first** — Adding test user is simpler than script debugging; should check UI controls before coding workarounds
4. **Netlify API is cleaner than web UI** — Future sessions should set env vars via API, not web forms

### 📋 Next Steps
1. Add `scott.magnacca1@gmail.com` as test user in Google Cloud Console (https://console.cloud.google.com/apis/credentials/consent?project=booking-widget)
2. Run `node get-token.mjs` to get Google Refresh Token
3. Set Netlify environment variables via API or web UI
4. Verify deployment with test booking
5. Set up custom domain DNS (CNAME `book` → `cheery-buttercream-a392fb.netlify.app`)
6. Test live widget at `https://book.scottmagnacca.com`

### 🔧 Credentials Obtained (Ready to Deploy)
```
GOOGLE_CLIENT_ID=[REDACTED_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[REDACTED_CLIENT_SECRET]
RESEND_API_KEY=(obtained May 3)
GOOGLE_CALENDAR_ID=scott.magnacca1@gmail.com
CALENDAR_TIMEZONE=America/New_York
CONFIRMATION_EMAIL_FROM=bookings@book.scottmagnacca.com
WIDGET_HOST=https://book.scottmagnacca.com
MAX_ADVANCE_DAYS=30
```

### 📁 Files Modified
- None (no code changes this session)

### 📝 Documentation Added
- `CLAUDE-PICKUP-PROMPT.md` — Complete handoff instructions for next session

---

## [May 3, 2026 - Earlier] Initial Project Setup

**Status:** Project initialized with Netlify deployment ready  
**Commits:** Last commit 0e7e680 (Move button outside flex container)

### Project Details
- **Name:** Booking Widget (self-hosted Calendly alternative)
- **Stack:** JavaScript (vanilla) + Netlify Functions (TypeScript) + Google Calendar API + Resend
- **Live URL:** https://cheery-buttercream-a392fb.netlify.app
- **GitHub:** https://github.com/smagnacca/booking-widget
- **Deployment:** GitHub Action hook on push to main → Netlify build → auto-deploy

---

## Future Versions

### Phase 1 (Current)
- ✅ Google Calendar integration (read/write)
- ✅ 15-min + 30-min meetings
- ✅ Auto-detect visitor timezone
- ✅ Light/dark theme
- ✅ Source tracking
- ✅ Confirmation emails
- ✅ Google Meet auto-generation
- ✅ Mobile responsive
- ⏳ **Pending:** Deploy to production with refresh token

### Phase 2 (Planned)
- 60-min meetings
- Theme customization
- Meeting type selector
- Timezone selector UI
- Daily booking limits
- Buffer time between meetings
- Email template customization

### Phase 3 (Future)
- Post-booking email sequences
- Stripe payment
- Admin dashboard
- Booking cancellation/rescheduling
- Multi-calendar conflict check
