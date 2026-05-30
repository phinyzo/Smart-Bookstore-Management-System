# Smart Bookstore Management System
## Deployment & Environment Setup Guide

> Powered by **PhinTech Solutions** — Built in Kenya 🇰🇪  
> https://phintechsolutions.com

---

## 🟢 Current Live Status

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://phintech-bookstore.vercel.app | ✅ Live |
| **Backend** | https://api-phintech-bookstore.vercel.app | ⚠️ Needs secrets (see Step 1 below) |

### ⚡ Step 1 — Add the 4 Required Secrets (run these now)

Open a terminal in `bookstore-backend/` and run each command, pasting the value when prompted:

```bash
cd bookstore-backend

# 1. MongoDB connection string (from MongoDB Atlas)
echo "mongodb+srv://USER:PASS@cluster.mongodb.net/bookstore" | vercel env add MONGO_URI production --yes

# 2. JWT secret (generate a strong random string, min 32 chars)
echo "your-super-secret-jwt-key-min-32-chars" | vercel env add JWT_SECRET production --yes

# 3. Lipia Online API key (from https://lipia-online.vercel.app/dashboard)
echo "your-lipia-api-key" | vercel env add LIPIA_API_KEY production --yes

# 4. License secret (generate a strong random string)
echo "your-license-secret-key-min-32-chars" | vercel env add LICENSE_SECRET production --yes
```

Then redeploy the backend:
```bash
vercel deploy --prod --yes
```

### Optional — Stripe (for card payments)
```bash
echo "sk_live_..." | vercel env add STRIPE_SECRET_KEY production --yes
echo "whsec_..."   | vercel env add STRIPE_WEBHOOK_SECRET production --yes
echo "pk_live_..." | vercel env add STRIPE_PUBLISHABLE_KEY production --yes
vercel deploy --prod --yes
```

### Optional — Email notifications (Gmail)
```bash
echo "your-gmail@gmail.com" | vercel env add EMAIL_USER production --yes
echo "your-app-password"    | vercel env add EMAIL_PASS production --yes
vercel deploy --prod --yes
```

### Frontend — Add Stripe public key (if using card payments)
```bash
cd bookstore-frontend
echo "pk_live_..." | vercel env add VITE_STRIPE_PUBLIC_KEY production --yes
vercel deploy --prod --yes
```

---

## Project Structure

```
Smart-Bookstore-Management-System/
├── bookstore-backend/     ← Node.js / Express API
└── bookstore-frontend/    ← React / Vite SPA
```

---

## Phase 1 — Prerequisites

Install these before deploying:

- Node.js 18+ — https://nodejs.org
- MongoDB Atlas account — https://cloud.mongodb.com
- Vercel CLI — `npm install -g vercel`
- Stripe account — https://stripe.com (optional, for card payments)
- Lipia Online account — https://lipia-online.vercel.app/dashboard (for M-Pesa)
- Gmail account with App Password enabled (for email notifications)

---

## Phase 2 — Backend Environment Variables

Create `bookstore-backend/.env` with these values:

```env
# ── Database ──────────────────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bookstore?retryWrites=true&w=majority

# ── Authentication ────────────────────────────────────────────
JWT_SECRET=<generate-a-strong-random-string-min-32-chars>

# ── Server ────────────────────────────────────────────────────
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://phintech-bookstore.vercel.app
BACKEND_URL=https://api-phintech-bookstore.vercel.app

# ── Stripe (Card Payments) ────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# ── Lipia Online (M-Pesa via Till Number) ─────────────────────
# Get API key from: https://lipia-online.vercel.app/dashboard
LIPIA_API_KEY=<your-lipia-api-key>
LIPIA_BASE_URL=https://lipia-api.kreativelabske.com/api/v2
LIPIA_PAYMENT_LINK=https://lipia-online.vercel.app/link/PHINTECHSOLUTIONS

# ── Email (Gmail SMTP) ────────────────────────────────────────
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=<gmail-app-password>
# Generate App Password: Google Account → Security → 2FA → App Passwords

# ── License System ────────────────────────────────────────────
LICENSE_SECRET=<generate-a-strong-random-string-min-32-chars>
```

---

## Phase 3 — Frontend Environment Variables

Create `bookstore-frontend/.env` with these values:

```env
VITE_API_URL=https://api-phintech-bookstore.vercel.app
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_LIPIA_PAYMENT_LINK=https://lipia-online.vercel.app/link/PHINTECHSOLUTIONS
```

---

## Phase 4 — Deploy Backend to Vercel

```bash
cd bookstore-backend

# Login to Vercel
vercel login

# Deploy (first time — follow prompts)
vercel --name api-phintech-bookstore

# Set environment variables
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add FRONTEND_URL
vercel env add BACKEND_URL
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add LIPIA_API_KEY
vercel env add LIPIA_BASE_URL
vercel env add LIPIA_PAYMENT_LINK
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
vercel env add LICENSE_SECRET

# Deploy to production
vercel --prod --name api-phintech-bookstore
```

---

## Phase 5 — Deploy Frontend to Vercel

```bash
cd bookstore-frontend

# Build first
npm run build

# Deploy
vercel --name phintech-bookstore

# Set environment variables
vercel env add VITE_API_URL
vercel env add VITE_STRIPE_PUBLIC_KEY
vercel env add VITE_LIPIA_PAYMENT_LINK

# Deploy to production
vercel --prod --name phintech-bookstore
```

---

## Phase 6 — Post-Deployment Setup

### 1. Update CORS in backend
After deploying frontend, update `FRONTEND_URL` env var to your actual Vercel URL:
```bash
vercel env rm FRONTEND_URL production
vercel env add FRONTEND_URL
# Enter: https://phintech-bookstore.vercel.app
vercel --prod
```

### 2. Configure Stripe Webhook
In Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://api-phintech-bookstore.vercel.app/api/payment/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the webhook signing secret → set as `STRIPE_WEBHOOK_SECRET`

### 3. Configure Lipia Online Callback
When initiating payments, the callback URL is automatically set to:
`https://api-phintech-bookstore.vercel.app/api/mpesa/callback`

Ensure your backend URL is publicly accessible (Vercel handles this automatically).

### 4. Create Admin User
After deployment, register a user then manually set their role to admin in MongoDB Atlas:
```javascript
// In MongoDB Atlas → Collections → users
// Find your user document and update:
{ $set: { role: "admin" } }
```

---

## Phase 7 — Lipia Online M-Pesa Setup

1. Visit https://lipia-online.vercel.app/dashboard
2. Sign up / log in
3. Create a new app
4. Go to App Details → Security tab
5. Generate your API key
6. Set `LIPIA_API_KEY` in your backend env vars
7. Your Till Number (PHINTECHSOLUTIONS) is already connected

**Payment Link:** https://lipia-online.vercel.app/link/PHINTECHSOLUTIONS

---

## Phase 8 — License Pricing (KES)

| Plan | Price | Duration |
|------|-------|----------|
| Free Trial | KES 0 | 14 days |
| Monthly Subscription | KES 2,000 | 30 days |
| Annual Subscription | KES 23,000 | 365 days |
| Lifetime License | KES 25,000 | Forever |

---

## Phase 9 — Health Checks

After deployment, verify these endpoints:

```bash
# Backend health
curl https://api-phintech-bookstore.vercel.app/health

# API root
curl https://api-phintech-bookstore.vercel.app/

# Books endpoint (public)
curl https://api-phintech-bookstore.vercel.app/api/books

# License pricing (public)
curl https://api-phintech-bookstore.vercel.app/api/license/pricing
```

---

## Phase 10 — Monitoring Recommendations

1. **Vercel Analytics** — Enable in Vercel dashboard for both projects
2. **MongoDB Atlas Monitoring** — Built-in performance metrics
3. **Uptime monitoring** — Use UptimeRobot (free) to ping `/health` every 5 minutes
4. **Error tracking** — Consider Sentry (free tier) for production error monitoring
5. **Log retention** — Vercel keeps 7 days of logs on free tier; upgrade for longer retention

---

## Backup Strategy

### Database Backups
- MongoDB Atlas M0 (free): No automated backups — upgrade to M10+ for point-in-time recovery
- Manual backup: `mongodump --uri="$MONGO_URI" --out=./backup-$(date +%Y%m%d)`
- Schedule weekly exports from Atlas UI → Collections → Export

### Code Backups
- Push to GitHub regularly: `git push origin main`
- Tag releases: `git tag v2.0.0 && git push --tags`

---

## Disaster Recovery

1. **Database failure**: Restore from Atlas backup or mongodump export
2. **Frontend down**: Redeploy from git: `vercel --prod` in frontend directory
3. **Backend down**: Redeploy from git: `vercel --prod` in backend directory
4. **Env vars lost**: Keep a secure copy in a password manager (1Password, Bitwarden)
5. **Domain issues**: Vercel provides fallback `.vercel.app` domains automatically

---

## Security Recommendations

1. Rotate `JWT_SECRET` and `LICENSE_SECRET` every 6 months
2. Use MongoDB Atlas IP allowlist — restrict to Vercel IP ranges
3. Enable MongoDB Atlas audit logging for production
4. Keep Stripe in test mode until fully verified, then switch to live keys
5. Never commit `.env` files — they are in `.gitignore`
6. Enable 2FA on all service accounts (Vercel, MongoDB, Stripe, Lipia Online)
7. Review Vercel deployment logs monthly for anomalies

---

## Maintenance Notes

- **Node.js updates**: Test on staging before updating production
- **Dependency updates**: Run `npm audit` monthly; apply security patches promptly
- **MongoDB indexes**: Monitor slow queries in Atlas Performance Advisor
- **License renewals**: The system auto-handles renewals via M-Pesa callbacks
- **Trial expiry**: Automatic — no manual intervention needed

---

*Powered by PhinTech Solutions — Built in Kenya 🇰🇪*  
*https://phintechsolutions.com*
