# Environment Variables Setup

## Create .env File

Since `.env.example` cannot be committed (for security), create your own `.env` file in the project root with the following content:

```env
# MongoDB Connection
# IMPORTANT: Replace <db_password> with your actual MongoDB password
MONGO_URI="mongodb+srv://mohsinshafqat579_db_user:<db_password>@cluster0.btfpptx.mongodb.net/?appName=Cluster0"

# JWT Authentication
# Generate a strong random string: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="CHANGE_THIS_TO_A_STRONG_SECRET"

# Stripe Configuration
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# AI Configuration (optional for future use)
AI_API_KEY="OPENAI_OR_OTHER_KEY"

# OCR Configuration
OCR_CONFIG="tesseract_config_or_provider"

# WhatsApp Contact
# Format: +[country code][number] (e.g., +1234567890 or +923269818457)
WHATSAPP_CONTACT="+923269818457"

# Application URLs
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"

# Node Environment
NODE_ENV="development"

# Server Port
PORT=5000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./storage/uploads"

# Email Configuration (Optional)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Admin Configuration
ADMIN_EMAIL="admin@ledgersmart.ai"
```

## Critical Steps

1. **Replace `<db_password>`** in `MONGO_URI` with your actual MongoDB password
2. **Generate JWT_SECRET** using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Get Stripe keys** from Stripe Dashboard
4. **Set WhatsApp number** in correct format (+country code + number)

## Security Notes

- Never commit `.env` file to Git
- `.env` is already in `.gitignore`
- Use different values for development and production
- Rotate secrets regularly in production

