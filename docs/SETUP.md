# Setup Guide

Complete setup instructions for LedgerSmart AI.

## Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payments)
- Git

## Step 1: Clone and Install

```bash
git clone <repository-url>
cd invoice
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## Step 2: Environment Variables

### Create `.env` file

Copy the example file:
```bash
cp .env.example .env
```

### Configure MongoDB

1. Get your MongoDB connection string from MongoDB Atlas
2. **IMPORTANT**: Replace `<db_password>` in `.env` with your actual database password:

```env
MONGO_URI="mongodb+srv://mohsinshafqat579_db_user:YOUR_ACTUAL_PASSWORD@cluster0.btfpptx.mongodb.net/?appName=Cluster0"
```

**Security Note**: Never commit the `.env` file with real passwords. The `.env.example` file contains placeholders only.

### Configure JWT Secret

Generate a strong random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```env
JWT_SECRET="your_generated_secret_here"
```

### Configure Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers > API keys
3. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY="sk_test_xxx"
   STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
   ```

### Configure Stripe Webhooks (for local testing)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_xxx"
   ```

### Configure WhatsApp Contact

Add your WhatsApp number to `.env`:
```env
WHATSAPP_CONTACT="+923269818457"
```

The number should include country code (e.g., +1 for US, +92 for Pakistan).

### Configure Application URLs

```env
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"
```

## Step 3: Seed Database (Optional)

For development, seed sample data:

```bash
npm run seed
```

This creates:
- Admin user: `admin@ledgersmart.ai` / `admin123`
- Test user: `user@example.com` / `user123`
- Free user: `free@example.com` / `free123`

## Step 4: Start Development Servers

### Option 1: Run both together
```bash
npm run dev
```

### Option 2: Run separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 5: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## Testing Stripe Payments

### Test Cards

Use these cards in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., 12/25)
- Any 3-digit CVC
- Any ZIP code

### Testing Webhooks

1. Start Stripe webhook forwarding (see Step 2)
2. Complete a test checkout
3. Check your backend logs for webhook events
4. Verify subscription status in database

## Troubleshooting

### MongoDB Connection Issues

- Verify your connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure the password doesn't contain special characters that need URL encoding

### Stripe Webhook Issues

- Make sure Stripe CLI is running and forwarding webhooks
- Check that `STRIPE_WEBHOOK_SECRET` matches the CLI output
- Verify webhook endpoint is accessible (for production)

### Port Already in Use

- Backend uses port 5000 by default
- Frontend uses port 3000 by default
- Change ports in `.env` or kill processes using those ports

### Module Not Found Errors

- Run `npm install` in root, backend, and frontend directories
- Delete `node_modules` and `package-lock.json`, then reinstall

## Next Steps

- Read [API Documentation](./API.md) for API usage
- Check [Deployment Guide](./DEPLOYMENT.md) for production setup
- Review [Architecture](./ARCHITECTURE.md) for system design

