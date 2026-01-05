# Deployment Guide

Complete deployment instructions for LedgerSmart AI.

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Ensure `frontend/package.json` has build script
2. Create `vercel.json` in root (optional):
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "devCommand": "cd frontend && npm run dev"
}
```

### Step 2: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

Or connect GitHub repository in Vercel Dashboard.

### Step 3: Environment Variables

In Vercel Dashboard, add:
- `VITE_BACKEND_URL` - Your backend API URL
- `VITE_WHATSAPP_CONTACT` - WhatsApp number

## Backend Deployment (Railway)

### Step 1: Prepare Backend

1. Ensure `backend/package.json` has start script
2. Create `railway.json` (optional):
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm start"
  }
}
```

### Step 2: Deploy to Railway

1. Connect GitHub repository
2. Select backend directory
3. Add environment variables (see below)
4. Deploy

### Step 3: Environment Variables

Add all variables from `.env.example`:
- `MONGO_URI` - **Replace `<db_password>` with real password**
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`
- `BACKEND_URL`
- `WHATSAPP_CONTACT`

## Backend Deployment (Render)

### Step 1: Create Web Service

1. Connect GitHub repository
2. Select backend directory
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`

### Step 2: Environment Variables

Add all variables as in Railway section above.

## Stripe Webhook Configuration

### Step 1: Create Webhook Endpoint

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. URL: `https://your-backend-url.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Step 2: Get Webhook Secret

1. After creating endpoint, click on it
2. Copy "Signing secret" (starts with `whsec_`)
3. Add to backend environment variables as `STRIPE_WEBHOOK_SECRET`

## Docker Deployment

### Build and Run

```bash
cd deployment/docker
docker-compose up -d
```

### Environment Variables

Create `.env` file in `deployment/docker/`:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
# ... other variables
```

## Kubernetes Deployment

See `deployment/kubernetes/deployment.yaml` for K8s configuration.

## Post-Deployment Checklist

- [ ] MongoDB connection working
- [ ] Stripe webhooks receiving events
- [ ] Frontend can connect to backend
- [ ] File uploads working
- [ ] OCR processing working
- [ ] AI analysis working
- [ ] Payment checkout working
- [ ] WhatsApp button showing correct number
- [ ] Environment variables all set correctly

## Monitoring

- Check application logs regularly
- Monitor Stripe webhook delivery
- Monitor MongoDB connection
- Set up error tracking (Sentry, etc.)

## Troubleshooting

### Webhooks Not Working

- Verify webhook URL is accessible
- Check webhook secret matches
- Review Stripe Dashboard webhook logs
- Check backend logs for errors

### MongoDB Connection Issues

- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure password is URL-encoded if needed

### File Upload Issues

- Check storage directory permissions
- Verify file size limits
- Check disk space
