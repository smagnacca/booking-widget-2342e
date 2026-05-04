# Pickup Prompt — Booking Widget — May 3, 2026

## Current Status
**Branch:** main  
**Last commit:** 0e7e680 (Move button outside flex container)  
**Project folder:** ~/Documents/Claude/Projects/booking-widget/  
**GitHub repo:** https://github.com/smagnacca/booking-widget  
**Netlify site:** cheery-buttercream-a392fb (https://cheery-buttercream-a392fb.netlify.app)

---

## What Was Completed This Session
- ✅ Reviewed booking widget README, DEPLOY-GUIDE, and netlify.toml
- ✅ Identified deployment path: Netlify + Google Calendar + Resend email
- ✅ Created Google Cloud project "booking-widget" with Calendar API enabled
- ✅ Created OAuth 2.0 credentials (Client ID + Client Secret obtained)
- ✅ Deployed to Netlify via GitHub fork (site: cheery-buttercream-a392fb)
- ✅ Obtained Resend API key for email confirmations
- ❌ **BLOCKED:** Google Refresh Token acquisition (OAuth verification issue)

---

## What's Blocking → ONE ACTION NEEDED

**The Issue:**  
The booking-widget Google Cloud project's OAuth consent screen is in "External" (test) mode. Google is blocking authorization until scott.magnacca1@gmail.com is added as a test user.

**The Fix (ONE click in Google Cloud):**

1. Open: `https://console.cloud.google.com/apis/credentials/consent?project=booking-widget`
2. Click the **"OAuth consent screen"** tab (at the top)
3. Scroll down to **"Test users"** section
4. Click **"+ ADD USERS"** button
5. Enter: `scott.magnacca1@gmail.com`
6. Click **Add**

**That's it.** Once complete, proceed to "Next Action" below.

---

## Credentials Ready to Deploy

These are already obtained and waiting to be set in Netlify environment variables:

```
GOOGLE_CLIENT_ID=[REDACTED_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[REDACTED_CLIENT_SECRET]
RESEND_API_KEY=(obtained earlier)
GOOGLE_CALENDAR_ID=scott.magnacca1@gmail.com
CALENDAR_TIMEZONE=America/New_York
CONFIRMATION_EMAIL_FROM=bookings@book.scottmagnacca.com
WIDGET_HOST=https://book.scottmagnacca.com
MAX_ADVANCE_DAYS=30
```

---

## Next Action (Start Here When Resuming)

1. **Add test user** (see "What's Blocking" above)
2. **Get Google Refresh Token:**
   ```bash
   cd ~/Documents/Claude/Projects/booking-widget
   node get-token.mjs
   ```
   - Browser opens → Sign in → Allow calendar access → Copy code from redirect URL
   - Paste code back to terminal script
   - Script outputs: `GOOGLE_REFRESH_TOKEN=...`

3. **Set all environment variables in Netlify via API:**
   ```bash
   export NETLIFY_TOKEN=$(cat ~/.claude/tokens/.netlify_token)
   SITE_ID="206f206e-cbbc-4488-98f3-ff603428d072"
   
   # Set each env var
   curl -X POST "https://api.netlify.com/api/v1/sites/$SITE_ID/env" \
     -H "Authorization: Bearer $NETLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"key":"GOOGLE_CLIENT_ID","value":"[REDACTED_CLIENT_ID]"}'
   # ... repeat for each var
   ```

4. **Verify deployment:**
   - Wait for Netlify build to complete
   - Test: `curl https://cheery-buttercream-a392fb.netlify.app/api/availability?timezone=America/New_York&meetingType=30`
   - Should return JSON with available slots

5. **Set custom domain:**
   - Create CNAME: `book` → `cheery-buttercream-a392fb.netlify.app`
   - Update WIDGET_HOST to `https://book.scottmagnacca.com` in Netlify env vars

6. **Final verification:**
   - Test widget at: https://cheery-buttercream-a392fb.netlify.app
   - Verify form works, email sends, Google Calendar event created

---

## Files That May Need Updates

- `.env` — Will be created with credentials once refresh token is obtained
- `netlify.toml` — Already correct; no changes needed
- `CLAUDE.md` — Update with lessons learned (see below)

---

## Lessons Learned & Best Practices

### ✅ What Worked
- **Netlify "Deploy with Netlify" button** — Fast fork + deploy, minimal friction
- **Splitting tasks:** Getting Client ID/Secret first, refresh token later, then env vars via API
- **Resend for email** — Free tier sufficient, API simple
- **Service account approach fallback** — Having `google-service-account.json` available as a backup authentication method

### ❌ What Didn't Work (Don't Repeat)
1. **Script-based OAuth flow (Node.js) w/ automatic browser opening**
   - Failed: Module resolution issues, port conflicts, redirect URL mismatches
   - Root cause: Node.js `require()` vs ES modules in package.json; localhost port already in use
   - Lesson: For OAuth flows, prefer Playwright or manual URL-based approach over custom Node servers

2. **Trying to use google-auth-library to add test users programmatically**
   - Failed: Requires gcloud CLI or specific Cloud Identity endpoints; too complex
   - Lesson: Google Cloud test user management is a UI operation, not easily automated via APIs

3. **Assuming OAuth would work without test user configuration**
   - Failed: Google blocks unverified apps unless user is explicitly added
   - Lesson: Always check OAuth consent screen test users BEFORE attempting authorization

4. **90-minute loop on OAuth refresh token retrieval**
   - Root cause: Not identifying the "test user" requirement early
   - Lesson: Read Google Cloud error messages carefully; "access_denied" + "Error 403" = test user missing, not bad credentials

### 📚 Best Practices Discovered
- **One-click fixes first:** When blocked, check if there's a single UI action that unblocks (test user add = 1 click)
- **Plan B pickup prompts:** When automation fails, document exactly where you are + next manual step so future sessions aren't guessing
- **Netlify API for env vars:** Much cleaner than web UI, more reliable for bulk updates
- **Separate concerns:** Get credentials → Set environment → Verify deployment (don't mix these)

---

## Don't Break These

- ✅ Public folder structure (widget.js, index.html, etc.)
- ✅ Netlify function routing (`/api/*` → `/.netlify/functions/:splat`)
- ✅ GitHub Action deploy hook (triggered on push to main)
- ✅ CORS headers for cross-origin widget embeds

---

## Session Summary

**Time spent:** ~90 minutes  
**Outcome:** 90% complete; blocked on 1 manual Google Cloud action  
**Next session effort:** ~15 minutes (once test user is added)  
**Estimated deployment finish:** May 3, 2026 (today, if test user is added now)

---

## To Resume

Paste this into Claude Code terminal:
```
Open: https://console.cloud.google.com/apis/credentials/consent?project=booking-widget
Click "OAuth consent screen" tab → Scroll to "Test users" → Click "+ ADD USERS" → Add scott.magnacca1@gmail.com
Done? Run: cd ~/Documents/Claude/Projects/booking-widget && node get-token.mjs
```

Then come back here with the refresh token code, and I'll finish the deployment via API (no more clicking).
