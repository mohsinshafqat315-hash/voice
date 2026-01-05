#!/bin/bash

# Setup script - initializes development environment
# Installs dependencies, sets up database, configures environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node_version() {
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version: $(node -v)"
}

# Check npm version
check_npm_version() {
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "npm version: $(npm -v)"
}

# Create necessary directories
create_directories() {
    print_header "Creating Directories"
    
    DIRS=(
        "storage/uploads"
        "storage/temp"
        "storage/processed"
        "logs"
    )
    
    for dir in "${DIRS[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        else
            print_info "Directory already exists: $dir"
        fi
    done
}

# Setup environment file
setup_env() {
    print_header "Setting Up Environment Variables"
    
    if [ -f ".env" ]; then
        print_warning ".env file already exists. Skipping creation."
        print_info "Please verify your .env file has all required variables."
        return
    fi
    
    print_info "Creating .env file from template..."
    
    cat > .env << 'EOF'
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
AI_API_KEY=""

# OCR Configuration
OCR_CONFIG="tesseract"

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

# Logging
LOG_LEVEL="INFO"
ENABLE_FILE_LOGGING="true"
EOF
    
    print_success ".env file created"
    print_warning "IMPORTANT: Please edit .env file and update the following:"
    print_warning "  1. Replace <db_password> in MONGO_URI with your MongoDB password"
    print_warning "  2. Generate JWT_SECRET using: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    print_warning "  3. Add your Stripe API keys from https://dashboard.stripe.com/apikeys"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_info "Installing root dependencies..."
    npm install
    
    print_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "All dependencies installed"
}

# Setup frontend environment
setup_frontend_env() {
    print_header "Setting Up Frontend Environment"
    
    if [ -f "frontend/.env" ]; then
        print_warning "frontend/.env already exists. Skipping creation."
        return
    fi
    
    print_info "Creating frontend/.env file..."
    
    cat > frontend/.env << 'EOF'
VITE_BACKEND_URL=http://localhost:5000/api
VITE_WHATSAPP_CONTACT=+923269818457
EOF
    
    print_success "Frontend environment file created"
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please create it first."
        exit 1
    fi
    
    print_info "Running migrations..."
    npm run migrate || {
        print_warning "Migrations failed. This might be normal if database is already set up."
    }
}

# Seed database (optional)
seed_database() {
    print_header "Database Seeding"
    
    read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Seeding database..."
        npm run seed || {
            print_warning "Seeding failed. This might be normal if database already has data."
        }
        print_success "Database seeding completed"
    else
        print_info "Skipping database seeding"
    fi
}

# Verify setup
verify_setup() {
    print_header "Verifying Setup"
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found"
        return 1
    fi
    
    # Check if node_modules exist
    if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
        print_error "Dependencies not installed"
        return 1
    fi
    
    # Check if directories exist
    if [ ! -d "storage/uploads" ] || [ ! -d "logs" ]; then
        print_error "Required directories not created"
        return 1
    fi
    
    print_success "Setup verification passed"
    return 0
}

# Main setup function
main() {
    print_header "LedgerSmart AI - Development Environment Setup"
    
    print_info "This script will:"
    print_info "  1. Check system requirements"
    print_info "  2. Create necessary directories"
    print_info "  3. Set up environment variables"
    print_info "  4. Install dependencies"
    print_info "  5. Run database migrations"
    print_info "  6. Optionally seed the database"
    
    echo
    read -p "Continue with setup? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled"
        exit 0
    fi
    
    # Run setup steps
    check_node_version
    check_npm_version
    create_directories
    setup_env
    setup_frontend_env
    install_dependencies
    run_migrations
    seed_database
    
    # Verify setup
    if verify_setup; then
        print_header "Setup Complete!"
        print_success "Your development environment is ready!"
        echo
        print_info "Next steps:"
        print_info "  1. Edit .env file with your MongoDB password and API keys"
        print_info "  2. Start the development server: npm run dev"
        print_info "  3. Backend will run on http://localhost:5000"
        print_info "  4. Frontend will run on http://localhost:3000"
        echo
        print_warning "Remember to update your .env file before starting the application!"
    else
        print_error "Setup verification failed. Please check the errors above."
        exit 1
    fi
}

# Run main function
main
