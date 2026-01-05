# LedgerSmart AI - Final Operations Guide

**Complete guide for operating LedgerSmart AI receipt and invoice management system**

---

## Table of Contents

1. [What This Software Does](#what-this-software-does)
2. [System Architecture](#system-architecture)
3. [Environment Setup](#environment-setup)
4. [MongoDB Setup](#mongodb-setup)
5. [OpenAI API Setup](#openai-api-setup)
6. [Stripe Setup](#stripe-setup)
7. [Running Backend Locally](#running-backend-locally)
8. [Running Frontend Locally](#running-frontend-locally)
9. [Deployment Steps](#deployment-steps)
10. [Common Errors & Solutions](#common-errors--solutions)
11. [Daily Operations](#daily-operations)
12. [User Onboarding](#user-onboarding)
13. [Payment Processing & Payouts](#payment-processing--payouts)
14. [Monitoring & Logs](#monitoring--logs)
15. [Scaling the System](#scaling-the-system)

---

## What This Software Does

**LedgerSmart AI** is an automated receipt and invoice management system that:

- **Uploads Receipts**: Users upload receipt images (JPG, PNG, PDF)
- **Extracts Data**: Uses OCR (Optical Character Recognition) to read text from receipts
- **AI Analysis**: Uses AI to categorize expenses, calculate risk scores, and detect duplicates
- **Tax Compliance**: Validates receipts against US and EU tax rules
- **Reports**: Generates CSV and PDF reports for accounting
- **Subscriptions**: Manages user subscriptions (Free, Pro, Business, Enterprise)
- **Payments**: Processes payments through Stripe

**Key Features:**
- Automatic expense categorization
- Risk scoring (0-100) to flag suspicious receipts
- Duplicate detection
- Tax compliance checking (US federal/state, EU VAT)
- Multi-currency support (USD, EUR, PKR)
- Dashboard with statistics and charts
- Export reports in CSV/PDF format

---

## System Architecture

### High-Level Overview

```
┌─────────────┐
│   Frontend  │  React.js web application
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼─────────────────────────────────────┐
│         Backend Server (Node.js)           │
│  ┌──────────────────────────────────────┐ │
│  │  Express.js API                       │ │
│  │  - Authentication (JWT)              │ │
│  │  - Receipt Upload & Processing        │ │
│  │  - Reports Generation                 │ │
│  │  - Stripe Integration                 │ │
│  └──────────────────────────────────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │  OCR Layer (Tesseract)               │ │
│  │  - Extracts text from images         │ │
│  └──────────────────────────────────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │  AI Layer (OpenAI/Anthropic)        │ │
│  │  - Categorization                    │ │
│  │  - Risk Scoring                      │ │
│  │  - Compliance Checking              │ │
│  └──────────────────────────────────────┘ │
└──────┬─────────────────────────────────────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
│  MongoDB    │ │  Stripe   │ │  OpenAI   │
│  Database   │ │  Payments  │ │  API      │
└─────────────┘ └───────────┘ └───────────┘
```

### Components

1. **Frontend** (`frontend/`): React.js application running in user's browser
2. **Backend** (`backend/`): Node.js server handling all business logic
3. **OCR** (`ocr/`): Text extraction from receipt images
4. **AI** (`ai/`): AI-powered analysis and categorization
5. **Database**: MongoDB stores users, receipts, payments, reports
6. **Storage**: Local filesystem or cloud storage (S3) for receipt images

---

## Environment Setup

### Step 1: Create `.env` File

Create a `.env` file in the project root with these variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/ledgersmart_ai

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key-here
AI_PROVIDER=openai
AI_MODEL=gpt-4-turbo-preview

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_BUSINESS_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# OCR Configuration
OCR_ENGINE=tesseract
TESSERACT_LANGUAGES=eng

# File Storage
FILE_STORAGE_PROVIDER=local

# Logging
LOG_LEVEL=info
```

### Step 2: Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` in your `.env` file.

---

## MongoDB Setup

### Option 1: Local MongoDB

1. **Install MongoDB**:
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB**:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   mongod
   ```

3. **Verify Connection**:
   - MongoDB runs on `mongodb://localhost:27017` by default
   - Update `MONGO_URI` in `.env` if needed

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Free tier is sufficient for development
3. **Get Connection String**: Copy the connection string
4. **Update `.env`**:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ledgersmart_ai
   ```

### Step 3: Run Database Migrations

```bash
cd backend
node ../scripts/migrate.js
```

This creates all necessary database indexes.

---

## OpenAI API Setup

### Step 1: Get API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

### Step 2: Add to `.env`

```
OPENAI_API_KEY=sk-your-key-here
AI_PROVIDER=openai
AI_MODEL=gpt-4-turbo-preview
```

### Step 3: Set Usage Limits (Recommended)

1. Go to **Settings** → **Usage limits**
2. Set monthly spending limit (e.g., $50)
3. This prevents unexpected charges

### Alternative: Anthropic Claude

If you prefer Claude:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_PROVIDER=anthropic
ANTHROPIC_MODEL=claude-3-opus-20240229
```

---

## Stripe Setup

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete business verification

### Step 2: Get API Keys

1. Go to **Developers** → **API keys**
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)
4. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   ```

### Step 3: Create Subscription Products

1. Go to **Products** → **Add product**
2. Create these products:

   **Pro Plan:**
   - Name: Pro Plan
   - Price: $15/month (recurring)
   - Copy the **Price ID** (starts with `price_`)
   - Add to `.env`: `STRIPE_PRO_PRICE_ID=price_xxxxx`

   **Business Plan:**
   - Name: Business Plan
   - Price: $39/month (recurring)
   - Copy the **Price ID**
   - Add to `.env`: `STRIPE_BUSINESS_PRICE_ID=price_xxxxx`

   **Enterprise Plan:**
   - Name: Enterprise Plan
   - Price: $99/month (recurring)
   - Copy the **Price ID**
   - Add to `.env`: `STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx`

### Step 4: Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing secret** (starts with `whsec_`)
6. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

### Step 5: Test Mode vs Live Mode

- **Test Mode**: Use `sk_test_` keys for development
- **Live Mode**: Use `sk_live_` keys for production
- Update `.env` when switching to production

---

## Running Backend Locally

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Ensure MongoDB is Running

```bash
# Check if MongoDB is running
# Windows: Check Services
# Mac/Linux: ps aux | grep mongod
```

### Step 3: Run Migrations

```bash
node ../scripts/migrate.js
```

### Step 4: Start Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### Step 5: Verify Backend is Running

- Open browser: `http://localhost:5000`
- You should see: `{"message":"LedgerSmart AI API"}`

### Common Backend Issues

**Issue**: `MongoDB connection failed`
- **Solution**: Ensure MongoDB is running and `MONGO_URI` is correct

**Issue**: `JWT_SECRET is not defined`
- **Solution**: Add `JWT_SECRET` to `.env` file

**Issue**: `Port 5000 already in use`
- **Solution**: Change `PORT` in `.env` or kill the process using port 5000

---

## Running Frontend Locally

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Update API URL

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000
```

### Step 3: Start Frontend

```bash
npm run dev
```

### Step 4: Access Application

- Open browser: `http://localhost:3000`
- You should see the login page

### Common Frontend Issues

**Issue**: `Cannot connect to API`
- **Solution**: Ensure backend is running on port 5000

**Issue**: `CORS error`
- **Solution**: Check `FRONTEND_URL` in backend `.env` matches frontend URL

---

## Deployment Steps

### Backend Deployment (Railway/Render/Heroku)

#### Option 1: Railway

1. **Create Account**: [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. **Select Repository**: Choose your LedgerSmart AI repo
4. **Set Root Directory**: `backend`
5. **Add Environment Variables**:
   - Copy all variables from `.env`
   - Paste into Railway's environment variables
6. **Deploy**: Railway automatically deploys on push

#### Option 2: Render

1. **Create Account**: [render.com](https://render.com)
2. **New** → **Web Service**
3. **Connect GitHub** → Select repository
4. **Settings**:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
5. **Environment Variables**: Add all from `.env`
6. **Deploy**

#### Option 3: Heroku

1. **Install Heroku CLI**: [devcenter.heroku.com](https://devcenter.heroku.com)
2. **Login**: `heroku login`
3. **Create App**: `heroku create ledgersmart-ai-backend`
4. **Set Config Vars**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI=your_mongo_uri
   # ... add all other variables
   ```
5. **Deploy**: `git push heroku main`

### Frontend Deployment (Vercel)

1. **Create Account**: [vercel.com](https://vercel.com)
2. **New Project** → **Import Git Repository**
3. **Root Directory**: `frontend`
4. **Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: Your backend URL (e.g., `https://your-backend.railway.app`)
6. **Deploy**

### Update Webhook URL

After deploying backend, update Stripe webhook URL:

1. Go to Stripe Dashboard → **Webhooks**
2. Edit your webhook endpoint
3. Update URL to: `https://your-backend-domain.com/api/webhooks/stripe`
4. Save

---

## Common Errors & Solutions

### Error: "MongoDB connection failed"

**Cause**: MongoDB is not running or connection string is wrong

**Solution**:
1. Check if MongoDB is running: `mongod --version`
2. Verify `MONGO_URI` in `.env` is correct
3. For Atlas, ensure IP is whitelisted

### Error: "JWT_SECRET is not defined"

**Cause**: Missing JWT secret in environment variables

**Solution**: Add `JWT_SECRET` to `.env` file

### Error: "OpenAI API key invalid"

**Cause**: API key is wrong or expired

**Solution**:
1. Check API key in OpenAI dashboard
2. Ensure key starts with `sk-`
3. Verify key has sufficient credits

### Error: "Stripe webhook signature verification failed"

**Cause**: Webhook secret doesn't match

**Solution**:
1. Get correct webhook secret from Stripe dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in `.env`
3. Restart backend server

### Error: "Receipt upload failed - OCR error"

**Cause**: Tesseract OCR not installed or image is corrupted

**Solution**:
1. Install Tesseract: `brew install tesseract` (Mac) or download installer (Windows)
2. Verify image format (JPG, PNG, PDF)
3. Check image is not corrupted

### Error: "Payment failed - subscription not created"

**Cause**: Stripe price ID is incorrect or product doesn't exist

**Solution**:
1. Verify price IDs in Stripe dashboard
2. Update `STRIPE_PRO_PRICE_ID`, etc. in `.env`
3. Ensure products are active in Stripe

---

## Daily Operations

### Morning Checklist

1. **Check Backend Logs**:
   ```bash
   tail -f logs/app.log
   tail -f logs/error.log
   ```

2. **Verify MongoDB Connection**:
   - Check backend is running
   - Verify database is accessible

3. **Check Stripe Dashboard**:
   - Review new payments
   - Check for failed payments
   - Review webhook events

4. **Monitor OpenAI Usage**:
   - Check API usage in OpenAI dashboard
   - Ensure credits are sufficient

### Daily Tasks

1. **Review High-Risk Receipts**:
   - Log into admin panel
   - Check receipts with risk score > 60
   - Approve or reject flagged receipts

2. **Process Failed Payments**:
   - Check Stripe dashboard for failed payments
   - Contact users if needed
   - Update subscription status manually if required

3. **Monitor System Health**:
   - Check server CPU/memory usage
   - Review error logs
   - Ensure backups are running

### Weekly Tasks

1. **Generate Reports**:
   - Export user activity reports
   - Review subscription metrics
   - Check revenue reports

2. **Database Maintenance**:
   - Check database size
   - Review slow queries
   - Optimize indexes if needed

3. **Backup Verification**:
   - Verify MongoDB backups are working
   - Test backup restoration

---

## User Onboarding

### Step 1: User Registration

1. User visits your website
2. Clicks **Sign Up**
3. Enters: Name, Email, Password
4. Clicks **Register**
5. System creates account with **Free** plan

### Step 2: First Receipt Upload

1. User logs in
2. Goes to **Upload** page
3. Selects receipt image (JPG, PNG, or PDF)
4. Clicks **Upload**
5. System processes:
   - OCR extracts text
   - AI categorizes expense
   - Risk score calculated
   - Receipt saved to database

### Step 3: View Dashboard

1. User sees dashboard with:
   - Total receipts count
   - Total expenses
   - Risk breakdown (Low/Medium/High)
   - Recent receipts list

### Step 4: Upgrade Subscription (Optional)

1. User clicks **Upgrade** or **Settings** → **Subscription**
2. Selects plan (Pro, Business, Enterprise)
3. Redirected to Stripe Checkout
4. Enters payment details
5. Payment processed
6. Subscription activated automatically via webhook

### Step 5: Generate Reports

1. User goes to **Reports** page
2. Selects date range and filters
3. Clicks **Export CSV** or **Export PDF**
4. Report downloads automatically

---

## Payment Processing & Payouts

### How Payments Work

1. **User Initiates Payment**:
   - User selects subscription plan
   - Backend creates Stripe Checkout session
   - User redirected to Stripe payment page

2. **Payment Processing**:
   - User enters card details
   - Stripe processes payment
   - Payment succeeds or fails

3. **Webhook Notification**:
   - Stripe sends webhook to backend
   - Backend verifies webhook signature
   - Backend updates user subscription
   - Backend creates payment record in database

4. **User Access**:
   - User's subscription status updated
   - Receipt limits increased
   - User can access premium features

### How Money Reaches You

**Stripe Payouts** (Automatic):

1. **Stripe Collects Payments**:
   - All subscription payments go to your Stripe account
   - Stripe holds funds temporarily (2-7 days)

2. **Automatic Payouts**:
   - Stripe automatically transfers funds to your bank account
   - Payout schedule: Daily, weekly, or monthly (configurable)
   - Go to Stripe Dashboard → **Settings** → **Bank accounts** to configure

3. **View Payouts**:
   - Go to Stripe Dashboard → **Payments** → **Payouts**
   - See all payouts and their status

**Manual Payouts** (If Needed):

1. Go to Stripe Dashboard → **Balance**
2. Click **Pay out funds manually**
3. Enter amount and confirm

### Setting Up Bank Account

1. Go to Stripe Dashboard → **Settings** → **Bank accounts**
2. Click **Add bank account**
3. Enter bank details:
   - Account number
   - Routing number
   - Account holder name
4. Verify account (Stripe sends small test deposits)
5. Confirm verification

### Payment Methods Supported

- Credit cards (Visa, Mastercard, Amex)
- Debit cards
- ACH Direct Debit (US only)
- SEPA Direct Debit (EU only)

### Handling Refunds

1. Go to Stripe Dashboard → **Payments**
2. Find the payment
3. Click **Refund**
4. Enter amount (full or partial)
5. Confirm refund
6. System automatically updates user subscription if needed

---

## Monitoring & Logs

### Backend Logs

**Location**: `backend/logs/`

- `app.log`: All application logs
- `error.log`: Error logs only
- `exceptions.log`: Unhandled exceptions
- `rejections.log`: Unhandled promise rejections

**View Logs**:

```bash
# Real-time log viewing
tail -f backend/logs/app.log

# Search for errors
grep -i error backend/logs/app.log

# View last 100 lines
tail -n 100 backend/logs/error.log
```

### Frontend Logs

Frontend logs appear in browser console:
- Open browser DevTools (F12)
- Go to **Console** tab
- View errors and warnings

### Database Monitoring

**MongoDB Atlas** (if using cloud):
- Go to Atlas dashboard
- View metrics: CPU, memory, connections
- Check slow queries

**Local MongoDB**:
```bash
# Connect to MongoDB shell
mongosh

# Check database stats
use ledgersmart_ai
db.stats()

# Check collection sizes
db.receipts.stats()
db.users.stats()
```

### Application Monitoring

**Recommended Tools**:

1. **Uptime Monitoring**: [UptimeRobot](https://uptimerobot.com)
   - Monitors backend URL
   - Sends alerts if down

2. **Error Tracking**: [Sentry](https://sentry.io)
   - Tracks errors automatically
   - Sends email alerts

3. **Performance Monitoring**: [New Relic](https://newrelic.com) or [Datadog](https://datadog.com)
   - Tracks response times
   - Monitors server resources

### Setting Up Alerts

**Email Alerts** (via Stripe):
1. Go to Stripe Dashboard → **Settings** → **Emails**
2. Enable alerts for:
   - Failed payments
   - Disputed charges
   - Payout failures

**Server Alerts** (via hosting provider):
- Railway/Render/Heroku send email alerts for:
  - Server crashes
  - High memory usage
  - Deployment failures

---

## Scaling the System

### When to Scale

**Signs you need to scale**:
- Slow response times (>2 seconds)
- High server CPU/memory usage (>80%)
- Database connection errors
- Users reporting timeouts

### Scaling Backend

**Option 1: Vertical Scaling** (More powerful server):
- Upgrade server plan (more CPU/RAM)
- Railway/Render/Heroku: Change plan in dashboard

**Option 2: Horizontal Scaling** (More servers):
- Deploy multiple backend instances
- Use load balancer (Railway/Render provide this)
- Ensure sessions are stateless (JWT tokens)

### Scaling Database

**MongoDB Atlas Scaling**:
1. Go to Atlas dashboard
2. Click **Edit Configuration**
3. Upgrade cluster tier
4. Enable sharding for very large datasets

**Local MongoDB Scaling**:
- Add more RAM
- Use SSD storage
- Optimize indexes

### Scaling File Storage

**Move to Cloud Storage** (S3, GCS, Azure):
1. Update `.env`:
   ```
   FILE_STORAGE_PROVIDER=s3
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_BUCKET_NAME=ledgersmart-receipts
   AWS_REGION=us-east-1
   ```
2. Update `backend/utils/drive.js` to use S3 SDK
3. Migrate existing files to S3

### Optimizing Performance

**Database Indexes**:
- Already created via migrations
- Monitor slow queries and add indexes if needed

**Caching**:
- Implement Redis for session caching
- Cache frequently accessed data (user profiles, stats)

**CDN for Frontend**:
- Vercel automatically provides CDN
- For custom deployment, use Cloudflare CDN

### Cost Optimization

**OpenAI API**:
- Use `gpt-3.5-turbo` instead of `gpt-4` for lower costs
- Implement request caching
- Batch process receipts when possible

**Stripe**:
- Use test mode during development
- Monitor transaction fees

**Hosting**:
- Start with free/low-cost tiers
- Scale up only when needed
- Use reserved instances for predictable workloads

---

## Quick Reference

### Important URLs

- **Backend API**: `http://localhost:5000` (local) or `https://your-backend.railway.app` (production)
- **Frontend**: `http://localhost:3000` (local) or `https://your-app.vercel.app` (production)
- **Stripe Dashboard**: [dashboard.stripe.com](https://dashboard.stripe.com)
- **OpenAI Dashboard**: [platform.openai.com](https://platform.openai.com)
- **MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com)

### Important Commands

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Run migrations
node scripts/migrate.js

# View logs
tail -f backend/logs/app.log

# Check MongoDB
mongosh
use ledgersmart_ai
db.receipts.countDocuments()
```

### Support Contacts

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **OpenAI Support**: [help.openai.com](https://help.openai.com)
- **MongoDB Support**: [support.mongodb.com](https://support.mongodb.com)

---

## Final Notes

- **Always backup your database** before major changes
- **Test in staging environment** before deploying to production
- **Monitor costs** regularly (OpenAI, hosting, Stripe fees)
- **Keep dependencies updated** for security patches
- **Review logs weekly** to catch issues early

---

**Last Updated**: 2024
**Version**: 1.0.0
**System**: LedgerSmart AI

