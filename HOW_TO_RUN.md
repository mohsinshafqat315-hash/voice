# How to Run LedgerSmart AI

Complete guide to get LedgerSmart AI up and running on your local machine.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Accessing the Application](#accessing-the-application)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Production Build](#production-build)

---

## 🚀 Quick Start

For experienced developers who want to get started quickly:

```bash
# 1. Install dependencies
npm run install:all

# 2. Set up environment (creates .env file)
# Edit .env and add your MongoDB password and API keys

# 3. Run database migrations
npm run migrate

# 4. (Optional) Seed sample data
npm run seed

# 5. Start development servers
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js 18+** 
   - Download from: https://nodejs.org/
   - Verify installation: `node -v` (should show v18.x.x or higher)
   - Verify npm: `npm -v` (should show 9.x.x or higher)

2. **MongoDB Atlas Account** (or local MongoDB)
   - Sign up at: https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string

3. **Stripe Account** (for payment features)
   - Sign up at: https://stripe.com
   - Get test API keys from Dashboard

4. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

### Optional Tools

- **Stripe CLI** (for webhook testing)
  - macOS: `brew install stripe/stripe-cli/stripe`
  - Windows: Download from https://github.com/stripe/stripe-cli/releases
  - Linux: See Stripe CLI documentation

---

## 🔧 Installation

### Step 1: Get the Code

If you have the code already, skip to Step 2. Otherwise:

```bash
# Clone the repository (if using Git)
git clone <repository-url>
cd invoice
```

### Step 2: Install Dependencies

Install all dependencies (root, backend, and frontend):

```bash
# Option 1: Use the convenience script
npm run install:all

# Option 2: Install manually
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

**Expected time:** 2-5 minutes depending on your internet connection.

### Step 3: Create Required Directories

The application will create these automatically, but you can create them manually:

```bash
mkdir -p storage/uploads storage/temp storage/processed logs
```

Or use the setup script:

```bash
bash scripts/setup.sh
```

---

## ⚙️ Configuration

### Step 1: Create Environment File

Create a `.env` file in the project root:

```bash
# On Linux/Mac
touch .env

# On Windows (PowerShell)
New-Item .env
```

### Step 2: Configure Environment Variables

Copy the following template into your `.env` file and fill in the values:

```env
# ============================================
# MONGODB CONFIGURATION
# ============================================
# Get from MongoDB Atlas Dashboard
# IMPORTANT: Replace <db_password> with your actual password
MONGO_URI="mongodb+srv://mohsinshafqat579_db_user:<db_password>@cluster0.btfpptx.mongodb.net/?appName=Cluster0"

# ============================================
# JWT AUTHENTICATION
# ============================================
# Generate a strong secret (run this command):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="CHANGE_THIS_TO_A_STRONG_SECRET"

# ============================================
# STRIPE CONFIGURATION
# ============================================
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# ============================================
# APPLICATION URLs
# ============================================
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"

# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV="development"
PORT=5000

# ============================================
# FILE UPLOAD
# ============================================
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./storage/uploads"

# ============================================
# WHATSAPP CONTACT
# ============================================
# Format: +[country code][number]
# Example: +1234567890 or +923269818457
WHATSAPP_CONTACT="+923269818457"

# ============================================
# OPTIONAL: AI/OCR CONFIGURATION
# ============================================
AI_API_KEY=""
OCR_CONFIG="tesseract"

# ============================================
# OPTIONAL: EMAIL CONFIGURATION
# ============================================
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# ============================================
# LOGGING
# ============================================
LOG_LEVEL="INFO"
ENABLE_FILE_LOGGING="true"
```

### Step 3: Configure MongoDB

1. **Get MongoDB Connection String:**
   - Log in to MongoDB Atlas
   - Go to your cluster → Connect → Connect your application
   - Copy the connection string

2. **Update MONGO_URI in .env:**
   - Replace `<db_password>` with your actual MongoDB password
   - If your password contains special characters, URL-encode them:
     - `@` becomes `%40`
     - `#` becomes `%23`
     - etc.

3. **Whitelist Your IP:**
   - In MongoDB Atlas → Network Access
   - Add your current IP address (or `0.0.0.0/0` for development)

### Step 4: Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as the value for `JWT_SECRET` in your `.env` file.

### Step 5: Configure Stripe

1. **Get API Keys:**
   - Go to https://dashboard.stripe.com
   - Navigate to Developers → API keys
   - Copy your **Test** keys (for development)

2. **Add to .env:**
   ```env
   STRIPE_SECRET_KEY="sk_test_51..."
   STRIPE_PUBLISHABLE_KEY="pk_test_51..."
   ```

3. **Set Up Webhooks (for local testing):**
   
   **Option A: Using Stripe CLI (Recommended for Development)**
   
   ```bash
   # Install Stripe CLI (if not installed)
   # macOS: brew install stripe/stripe-cli/stripe
   
   # Login to Stripe
   stripe login
   
   # Forward webhooks to local server
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
   
   Copy the webhook signing secret (starts with `whsec_`) and add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_xxx"
   ```
   
   **Option B: Manual Webhook Setup (for Production)**
   - In Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-backend-url.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy the webhook signing secret

### Step 6: Configure Frontend Environment

Create `frontend/.env` file:

```bash
# On Linux/Mac
touch frontend/.env

# On Windows (PowerShell)
New-Item frontend/.env
```

Add the following:

```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_WHATSAPP_CONTACT=+923269818457
```

---

## 🏃 Running the Application

### Option 1: Run Both Servers Together (Recommended)

From the project root:

```bash
npm run dev
```

This starts both backend and frontend servers simultaneously.

### Option 2: Run Servers Separately

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```

### Option 3: Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 🌐 Accessing the Application

Once the servers are running, access the application at:

- **Frontend (Web App):** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

### Default Test Accounts

If you seeded the database, you can use these accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@ledgersmart.ai | admin123 | Admin |
| test@example.com | test123 | User (Pro) |
| user1@example.com | password123 | User (Free) |

---

## 🗄️ Database Setup

### Run Migrations

Set up database indexes and structure:

```bash
npm run migrate
```

### Seed Sample Data (Optional)

Populate the database with test data:

```bash
npm run seed
```

This creates:
- Sample users with different subscription plans
- Sample receipts with various risk levels
- Test data for development

**Note:** Only run this in development. Never seed production databases.

---

## 🧪 Testing

### Test Stripe Payments

Use these test card numbers in Stripe Checkout:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

**Use any:**
- Future expiry date (e.g., 12/25)
- Any 3-digit CVC
- Any ZIP code

### Test Receipt Upload

1. Go to http://localhost:3000/upload
2. Upload a receipt image (JPEG, PNG, WEBP, or PDF)
3. Wait for OCR and AI processing
4. Review the results

### Test API Endpoints

Use tools like Postman or curl:

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🔍 Troubleshooting

### Problem: MongoDB Connection Failed

**Symptoms:**
- Error: "MongoServerError: Authentication failed"
- Error: "MongooseServerSelectionError"

**Solutions:**
1. Verify `MONGO_URI` in `.env` has correct password
2. Check IP whitelist in MongoDB Atlas
3. Ensure password is URL-encoded if it contains special characters
4. Test connection string in MongoDB Compass

### Problem: Port Already in Use

**Symptoms:**
- Error: "EADDRINUSE: address already in use :::5000"
- Error: "Port 3000 is already in use"

**Solutions:**

**Windows:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)
```

Or change the port in `.env`:
```env
PORT=5001
```

### Problem: Module Not Found

**Symptoms:**
- Error: "Cannot find module 'xxx'"
- Error: "Module not found: Error: Can't resolve 'xxx'"

**Solutions:**
1. Delete `node_modules` folders:
   ```bash
   rm -rf node_modules backend/node_modules frontend/node_modules
   ```
2. Delete lock files:
   ```bash
   rm -f package-lock.json backend/package-lock.json frontend/package-lock.json
   ```
3. Reinstall:
   ```bash
   npm run install:all
   ```

### Problem: Stripe Webhooks Not Working

**Symptoms:**
- Subscriptions not updating after payment
- Webhook events not received

**Solutions:**
1. **For Development:**
   - Ensure Stripe CLI is running: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`
   - Verify `STRIPE_WEBHOOK_SECRET` matches CLI output
   - Check backend logs for webhook errors

2. **For Production:**
   - Verify webhook URL is accessible
   - Check webhook secret in Stripe Dashboard matches `.env`
   - Review Stripe Dashboard → Webhooks → Logs

### Problem: File Upload Fails

**Symptoms:**
- Error: "File size exceeds limit"
- Error: "Invalid file type"

**Solutions:**
1. Check file size (max 10MB)
2. Ensure file is JPEG, PNG, WEBP, or PDF
3. Verify `storage/uploads` directory exists and is writable
4. Check `MAX_FILE_SIZE` in `.env`

### Problem: Frontend Can't Connect to Backend

**Symptoms:**
- Error: "Network Error"
- Error: "Failed to fetch"

**Solutions:**
1. Verify backend is running on port 5000
2. Check `VITE_BACKEND_URL` in `frontend/.env`
3. Ensure CORS is configured correctly
4. Check browser console for detailed errors

### Problem: JWT Token Errors

**Symptoms:**
- Error: "Invalid token"
- Error: "Token expired"
- Constant redirects to login

**Solutions:**
1. Clear browser localStorage:
   ```javascript
   // In browser console
   localStorage.clear()
   ```
2. Verify `JWT_SECRET` is set in `.env`
3. Restart backend server after changing `JWT_SECRET`

### Problem: OCR/AI Processing Fails

**Symptoms:**
- Receipt upload succeeds but no analysis
- Error: "OCR processing failed"

**Solutions:**
1. Check backend logs for detailed error
2. Ensure image is clear and readable
3. Verify Tesseract.js is installed (included in dependencies)
4. For production, consider using cloud OCR services

---

## 🏗️ Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/` directory.

### Start Production Backend

```bash
cd backend
NODE_ENV=production npm start
```

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"
BACKEND_URL="https://api.yourdomain.com"
MONGO_URI="your_production_mongodb_uri"
STRIPE_SECRET_KEY="sk_live_xxx"  # Use live keys
STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"  # Production webhook secret
```

**Security Checklist:**
- ✅ Use strong, unique passwords
- ✅ Use production Stripe keys
- ✅ Enable HTTPS
- ✅ Set up proper CORS origins
- ✅ Use environment-specific MongoDB
- ✅ Enable rate limiting
- ✅ Set up monitoring and logging

---

## 📝 Common Commands Reference

```bash
# Install all dependencies
npm run install:all

# Run development servers
npm run dev

# Run backend only
cd backend && npm run dev

# Run frontend only
cd frontend && npm run dev

# Run database migrations
npm run migrate

# Seed sample data
npm run seed

# Build for production
cd frontend && npm run build

# Start production backend
cd backend && npm start

# Clean temporary files
node scripts/cleanup.js

# Run tests
cd backend && npm test
```

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check Logs:**
   - Backend: Check terminal output or `logs/` directory
   - Frontend: Check browser console (F12)

2. **Verify Configuration:**
   - Double-check all `.env` variables
   - Ensure MongoDB connection string is correct
   - Verify Stripe keys are valid

3. **Common Issues:**
   - Restart both servers
   - Clear browser cache and localStorage
   - Delete `node_modules` and reinstall

4. **Documentation:**
   - See `docs/SETUP.md` for detailed setup
   - See `docs/DEPLOYMENT.md` for deployment guide
   - See `ENV_SETUP.md` for environment variables

---

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] Node.js 18+ installed
- [ ] All dependencies installed (`npm run install:all` completed)
- [ ] `.env` file created and configured
- [ ] `frontend/.env` file created
- [ ] MongoDB connection string updated with password
- [ ] JWT_SECRET generated and set
- [ ] Stripe API keys added
- [ ] Database migrations run (`npm run migrate`)
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000/health
- [ ] Can register/login
- [ ] Can upload a receipt

---

## 🎉 You're All Set!

Once all checks pass, you're ready to use LedgerSmart AI!

**Next Steps:**
1. Register a new account or use test credentials
2. Upload your first receipt
3. Explore the dashboard and features
4. Review AI analysis results
5. Test subscription upgrades (using test cards)

**Happy coding! 🚀**

