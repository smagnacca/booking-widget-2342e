# Best Practices: Google Cloud Integration & OAuth Deployment

> Lessons learned from booking-widget deployment (May 4, 2026). Apply these rules to avoid common pitfalls on future projects that integrate with Google Cloud APIs.

---

## 🎯 Pre-Deployment Checklist

### Before Creating Credentials
- [ ] **Verify the API is enabled in Google Cloud project** — Do this FIRST before creating OAuth credentials
- [ ] Go to APIs & Services > Enabled APIs & Services
- [ ] Search for the API you need (e.g., "Google Calendar API")
- [ ] Click "Enable" if not already enabled
- [ ] Wait for confirmation (~10-30 seconds) before creating credentials

**Why:** If the API isn't enabled, all auth flows will succeed but API calls will fail with `unauthorized_client`. The error doesn't indicate the root cause.

### OAuth Credentials Setup
- [ ] Create credentials as "Desktop App" (for server-to-server)
- [ ] Download the JSON credentials file IMMEDIATELY (don't rely on browser history)
- [ ] Extract: `client_id`, `client_secret`, `redirect_uri` (must match what you use in code)
- [ ] Save these values to `.env` (not git, not code files)

### Test User Configuration (Google External App)
- [ ] If using "External" consent screen (test/development), add test users
- [ ] Go to APIs & Services > OAuth Consent Screen
- [ ] Click "Add Users" in Test Users section
- [ ] Add your email address (e.g., scott.magnacca1@gmail.com)
- [ ] Wait ~5 minutes for propagation
- [ ] Test OAuth flow: should now accept your user account

**Why:** Without this, you'll see `Error 403: access_denied` even though credentials are valid. The error message doesn't say "add test user"—you have to infer it.

---

## 🔄 OAuth Refresh Token Acquisition

### Recommended Approach: Local Node.js OAuth Server
**DON'T:** Browser automation (too fragile), OAuth Playground (requires clicking third-party UIs), External libraries (adds dependencies)  
**DO:** Create a minimal local HTTP server that:
1. Serves the authorization URL
2. Listens for Google's callback with `?code=`
3. Exchanges code for tokens
4. Saves refresh token to a file

**Template:**
```javascript
import http from 'http';
import { exec } from 'child_process';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');
  
  if (code) {
    // Exchange code for tokens
    const tokens = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: 'http://localhost:3000',
        grant_type: 'authorization_code',
      }),
    });
    const data = await tokens.json();
    // Save data.refresh_token
  }
});
server.listen(3000);
```

**User action required:** Click one URL in browser, approve once, done.  
**Reliability:** 95%+ (only needs basic HTTP + fetch).

---

## 🚀 Netlify Deployment

### Before Deploying Functions
- [ ] **Verify `package.json` exists** with all dependencies you use in functions
- [ ] Run `npm install` locally to generate `package-lock.json`
- [ ] Commit BOTH files to git (Netlify reads `package.json` during build)
- [ ] Verify no hardcoded secrets in TypeScript (use env vars instead)

**Why:** Netlify Functions must have `package-lock.json` to bundle node_modules. Without it, functions fail at runtime with `"Could not resolve '...'"`

### Pushing to Netlify
- [ ] If updating environment variables: use `netlify deploy --prod --skip-functions-cache`
- [ ] Never use `netlify deploy --prod` alone after env var changes (may serve cached functions)
- [ ] Wait for deployment to reach "ready" state before testing

**Command to verify deploy status:**
```bash
curl -s "https://api.netlify.com/api/v1/sites/{siteId}/deploys?limit=1" \
  -H "Authorization: Bearer $NETLIFY_TOKEN" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"State: {d[0]['state']}\")"
```

### Environment Variables on Netlify
- [ ] Set via Netlify dashboard OR Netlify CLI (not in code)
- [ ] Use this format for CLI:
  ```bash
  netlify env:set GOOGLE_CLIENT_ID "value"
  netlify env:set GOOGLE_REFRESH_TOKEN "value"
  ```
- [ ] Verify env vars are set:
  ```bash
  netlify env:list
  ```
- [ ] Never commit `.env` to git (add to `.gitignore`)

---

## 🧪 Testing Checklist

### Local Testing (Before Netlify Deploy)
```bash
# Create .env with test credentials
export $(cat .env | xargs)

# Run local functions server
netlify dev

# Test API endpoint
curl "http://localhost:8888/api/availability?timezone=America/New_York&meetingType=30"
```

### Production Testing (After Netlify Deploy)
```bash
# Wait 30 seconds for deploy to finish
sleep 30

# Test live API
curl "https://your-site.netlify.app/api/availability?timezone=America/New_York&meetingType=30"

# Verify response has slots (not error)
# Example: {"slots": [{...}, ...], "timezone": "America/New_York"}
```

**Don't report as "deployed" until you've verified the live endpoint returns 200 OK.**

---

## ❌ Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `unauthorized_client` | Calendar API not enabled in Cloud project | Enable API in Google Cloud Console |
| `unauthorized_client` | Test user not added (External app) | Add email to OAuth consent screen > Test Users |
| `Could not resolve 'googleapis'` | No `package.json` or dependencies not installed | Create `package.json`, run `npm install`, commit `package-lock.json` |
| `Could not resolve 'googleapis'` (after deploy) | Function cache serving old build | Use `--skip-functions-cache` on redeploy |
| `Error 403: access_denied` | External app without test user | Add your email to test users list |
| `refresh_token` is `null` | Missing `access_type=offline` in OAuth URL | Add `access_type=offline&prompt=consent` to authorization URL |

---

## 📋 Secrets Management

### Never Commit Secrets
- [ ] `.env` → `.gitignore`
- [ ] OAuth credentials JSON → not in repo
- [ ] Refresh tokens → generated once, stored in Netlify env vars only
- [ ] `get-refresh-token.mjs` (with hardcoded secrets) → delete after obtaining token

### Safe Workflow
1. **Local development:** Create `.env` file, add to `.gitignore`, never commit
2. **Netlify production:** Set env vars via `netlify env:set`, verify with `netlify env:list`
3. **Temporary scripts:** Delete after use (e.g., OAuth server script that contains client secrets)
4. **Code review:** Always check `git diff` before pushing—if you see secrets, abort the commit

---

## 🎓 Summary of Lessons

1. **Verify APIs are enabled BEFORE creating credentials.** The error message doesn't tell you the API is missing.
2. **Use local HTTP servers for one-off OAuth flows.** Simpler than browser automation, more reliable.
3. **Always install npm dependencies before deploying to Netlify.** Functions need `package-lock.json`.
4. **Use `--skip-functions-cache` after env var changes.** Otherwise, Netlify serves the old build.
5. **Test the live endpoint before reporting "deployed."** 200 OK from the live URL = deployed. Anything else = not done.
6. **Never commit secrets.** Use `.gitignore` for `.env` and temporary credential files.
7. **Add test users for External apps.** Without this step, OAuth will mysteriously fail for your account.

---

## 📞 Future Projects Using Google Cloud APIs

Apply this entire checklist to any project using:
- Google Calendar API
- Google Sheets API
- Google Drive API
- Google Gmail API
- Any other Google Cloud API

The root causes and solutions are identical across all APIs.
