# 🚀 Deploy Your Booking Widget — Web Clicks Only (No Terminal!)

**You're 3 web form fill-outs away from a live booking widget.**

This guide uses **only web browsers** — no terminal, no code, no tech knowledge needed.

---

## Step 1: Get Your Google Credential (5 minutes)

### 1a. Open Google Cloud Console

Click here: https://console.cloud.google.com

Sign in with: **scott.magnacca1@gmail.com**

### 1b. Create a New Project

In the top-left, you'll see a blue box with a project name. Click it.

**Click:** "New Project"

**Type:** `booking-widget`

**Click:** "Create"

*(Wait 30 seconds for it to load)*

### 1c. Enable Calendar API

In the search box at the top, type: `google calendar api`

**Click:** "Google Calendar API" (first result)

**Click:** The big blue "Enable" button

*(Wait 10 seconds)*

### 1d. Get Your Credentials

On the left menu, **Click:** "Credentials"

**Click:** "Create Credentials" (blue button)

**Choose:** "OAuth client ID"

A popup will appear saying "You need to configure the OAuth consent screen first"

**Click:** "Configure Consent Screen"

### 1e. Configure Consent Screen

**Select:** "External"

**Click:** "Create"

On the form:
- **App name:** `booking-widget`
- **User support email:** `scott.magnacca1@gmail.com`
- **Developer contact:** `scott.magnacca1@gmail.com`

**Click:** "Save and Continue"

Skip the scopes page — **Click:** "Save and Continue" again

Skip the test users page — **Click:** "Save and Continue" again

### 1f. Get OAuth Credentials

**Go back** to Credentials page (left menu → "Credentials")

**Click:** "Create Credentials" → "OAuth client ID"

**Choose:** "Desktop application"

**Name:** `booking-widget`

**Click:** "Create"

A popup shows your **Client ID** and **Client Secret**

⭐ **COPY THESE TWO VALUES — You'll need them in Step 3**

```
CLIENT_ID: (copy this)
CLIENT_SECRET: (copy this)
```

---

## Step 2: Get Your Resend Email Credential (2 minutes)

### 2a. Open Resend

Click here: https://resend.com

**Click:** "Sign Up"

**Enter:** `scott.magnacca1@gmail.com`

**Create:** A password (you'll remember it)

**Click:** "Sign Up"

*(Verify your email — check your inbox)*

### 2b. Get API Key

After login, look for a menu or settings. **Click:** "API Keys"

**Click:** "Create API Key"

**Name:** `booking-widget`

**Click:** "Create"

⭐ **COPY THE API KEY — You'll need it in Step 3**

```
RESEND_API_KEY: (copy this)
```

---

## Step 3: Deploy with One Click (2 minutes)

Click this button:

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/smagnacca/booking-widget)

### 3a. Connect GitHub

**Click:** "Connect to GitHub"

Your browser will ask you to authorize. **Click:** "Authorize netlify"

### 3b. Fill in Your Credentials

A form will appear with fields for:

```
GOOGLE_CLIENT_ID        ← Paste from Step 1f
GOOGLE_CLIENT_SECRET    ← Paste from Step 1f
RESEND_API_KEY          ← Paste from Step 2b
```

**Paste** each value into the matching box.

**Click:** "Save"

### 3c. Deploy!

Netlify will show a blue "Deploy" button.

**Click:** "Deploy"

*(Wait 2-3 minutes while it builds...)*

When it's done, you'll see: ✅ **"Your site is live!"**

---

## Step 4: Point Your Domain (2 minutes)

Netlify created a temporary URL like `booking-widget-abc123.netlify.app`

To use your custom domain `book.scottmagnacca.com`:

### 4a. Find Your Netlify Domain

In the Netlify dashboard, look for a section that says **"Domain settings"** or **"Custom domains"**

**Copy** the Netlify domain (like `booking-widget-abc123.netlify.app`)

### 4b. Add DNS Record

Go to where you manage **scottmagnacca.com** (probably GoDaddy, Namecheap, or similar)

Look for **"DNS"** or **"Domain Settings"**

**Create a new record:**
- **Type:** CNAME
- **Name:** `book`
- **Value:** (paste the Netlify domain from 4a)

**Save**

*(Wait 5 minutes for DNS to update)*

---

## Done! ✅

Your booking widget is now live at:

```
https://book.scottmagnacca.com
```

Embed it on any website with:

```html
<script src="https://book.scottmagnacca.com/widget.js"></script>
<div id="scott-booking-widget" data-type="30" data-theme="dark" data-source="salesforlife"></div>
```

---

## Test It

1. Go to https://book.scottmagnacca.com
2. Click "Select a Time"
3. Pick a time slot
4. Enter your name + email
5. Click "Confirm"
6. Check your email for confirmation
7. Check your Google Calendar — event should be there!

---

## Troubleshooting

**"DNS not working"**
- Wait 10-15 minutes for DNS to propagate
- Test: `nslookup book.scottmagnacca.com` (if you know what that is!)
- Or contact your domain registrar

**"No availability slots"**
- You don't have any free time in Google Calendar
- Add some open blocks to your calendar
- Reload the widget

**"Email not arriving"**
- Check spam folder
- Make sure you pasted RESEND_API_KEY correctly

---

## That's It!

You now have a **self-hosted, zero-cost alternative to Calendly** ✨

No terminal. No code. Just web forms.

---

**Next Steps (Optional):**
- Customize widget theme (light/dark)
- Add different meeting types (15-min, 60-min)
- Embed on multiple sites
- Set up email sequences after bookings

All of these are in the `README.md` or `CLAUDE.md` files if you need them.

