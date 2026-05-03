# Quick Start — Run These 3 Commands

The setup scripts handle all the technical steps. Just follow the prompts.

## Command 1: Google OAuth2 Setup (15 min)

```bash
cd ~/Documents/Claude/Projects/booking-widget
./scripts/setup-oauth2.sh
```

**What it does:**
- Walks you through Google Cloud Console setup
- Automatically gets your refresh token
- Saves credentials to `.env`

**What you need:**
- Google account (scott.magnacca1@gmail.com)
- Browser (to authorize)

---

## Command 2: Resend Email Setup (5 min)

```bash
./scripts/setup-resend.sh
```

**What it does:**
- Walks you through Resend setup
- Gets API key
- Saves to `.env`

**What you need:**
- Email address (for Resend signup)

---

## Command 3: Test Locally (5 min)

```bash
./scripts/test-local.sh
```

**What it does:**
- Installs dependencies
- Starts local dev server at http://localhost:8888
- Shows testing checklist

**What to test:**
- Click "Select a Time" → slots load
- Select a time → form appears
- Enter name + email
- Click "Confirm Booking"
- Check email for confirmation
- Check Google Calendar for new event

If all tests pass → **Ready to deploy!**

---

## Command 4: Deploy to Netlify (10 min)

```bash
./scripts/deploy-netlify.sh
```

**What it does:**
- Logs into Netlify
- Creates/links your site
- Uploads secrets to Netlify
- Deploys to production

**What you need:**
- Netlify account (free at netlify.com)

---

## Command 5: DNS Setup (5 min)

After deploy, create one DNS record:

**Where:** Your domain registrar (wherever you manage scottmagnacca.com)

**What to add:**
- **Type:** CNAME
- **Name:** `book`
- **Value:** `[your-netlify-site].netlify.app`

Example:
- Name: `book`
- Value: `booking-widget.netlify.app`

**Test:**
```bash
curl https://book.scottmagnacca.com/api/availability?timezone=America/New_York&meetingType=30
```

Should return JSON with available slots.

---

## Embed Code (Once Live)

```html
<script src="https://book.scottmagnacca.com/widget.js"></script>

<div id="scott-booking-widget"
     data-type="30"
     data-theme="dark"
     data-source="salesforlife">
</div>
```

---

## That's It!

Run the 5 commands above in order. Each script guides you step-by-step. No terminal knowledge needed — just follow the prompts.

**Total time: ~40 minutes** (mostly waiting for Google/Resend/Netlify setup)

---

## Troubleshooting

**"Command not found"**
```bash
chmod +x ~/Documents/Claude/Projects/booking-widget/scripts/*.sh
```

**"npm: command not found"**
- Install Node.js: https://nodejs.org (v18+)

**"netlify: command not found"**
```bash
npm install -g netlify-cli
```

**Scripts won't run**
- Try: `bash scripts/setup-oauth2.sh` instead

---

**Questions?** Check `SETUP.md` for detailed explanations.
