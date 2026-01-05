# LedgerSmart AI - Complete Project Structure

## 📁 Project Overview

Enterprise-ready AI-powered Receipt & Invoice Management Tool with complete folder structure for US and EU markets.

---

## 📂 Root Level Files

```
├── .gitignore              # Git ignore rules
├── package.json            # Root package.json with workspace scripts
├── README.md               # Project overview and setup instructions
├── TAX_RULES.md            # Tax rules reference (US + EU)
├── CONTRIBUTING.md         # Contribution guidelines
└── project_structure.txt   # Generated folder tree
```

---

## 🎨 Frontend (React.js)

```
frontend/
├── package.json            # Frontend dependencies
├── vite.config.js          # Vite build configuration
├── index.html              # HTML entry point
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier formatting rules
│
└── src/
    ├── main.jsx            # React app entry point
    ├── App.jsx              # Root App component
    │
    ├── pages/              # Page components
    │   ├── Dashboard.jsx    # Main dashboard with statistics
    │   ├── Upload.jsx       # Receipt upload interface
    │   ├── AISuggestions.jsx # AI-powered recommendations
    │   ├── Reports.jsx      # Financial reports
    │   ├── AuditMode.jsx   # Audit view with risk scoring
    │   ├── Login.jsx        # User login
    │   └── Register.jsx     # User registration
    │
    ├── components/         # Reusable components
    │   ├── Charts/
    │   │   ├── LineChart.jsx    # Trend charts
    │   │   ├── BarChart.jsx     # Comparison charts
    │   │   └── PieChart.jsx     # Distribution charts
    │   ├── Tables/
    │   │   ├── ReceiptTable.jsx # Receipt listing
    │   │   └── ExpenseTable.jsx # Expense listing
    │   ├── Cards/
    │   │   ├── ReceiptCard.jsx  # Receipt summary card
    │   │   └── StatCard.jsx     # Statistics card
    │   ├── Buttons/
    │   │   ├── PrimaryButton.jsx   # Primary action button
    │   │   └── SecondaryButton.jsx # Secondary button
    │   ├── Forms/
    │   │   ├── UploadForm.jsx   # File upload form
    │   │   ├── ReceiptForm.jsx  # Receipt edit form
    │   │   └── FilterForm.jsx   # Advanced filters
    │   └── Modals/
    │       ├── ConfirmModal.jsx # Confirmation dialog
    │       ├── ReceiptModal.jsx # Receipt detail modal
    │       └── ExportModal.jsx  # Export options modal
    │
    ├── services/           # API services
    │   ├── api.js          # HTTP client configuration
    │   ├── auth.js         # Authentication service
    │   ├── receipts.js     # Receipt API calls
    │   ├── reports.js      # Report API calls
    │   └── notifications.js # Toast notifications
    │
    ├── context/            # React Context providers
    │   ├── AuthContext.jsx    # Global auth state
    │   └── ReceiptContext.jsx # Global receipt state
    │
    ├── hooks/              # Custom React hooks
    │   ├── useAuth.js      # Authentication hook
    │   └── useReceipts.js  # Receipt operations hook
    │
    ├── utils/              # Utility functions
    │   ├── formatters.js   # Currency, date formatting
    │   └── constants.js    # Frontend constants
    │
    └── assets/             # Static assets
        ├── images/         # Image files
        ├── icons/          # Icon files
        └── styles/         # CSS/SCSS files
            ├── variables.css   # CSS variables
            ├── global.css      # Global styles
            └── components.css  # Component styles
```

---

## ⚙️ Backend (Node.js + Express)

```
backend/
├── package.json            # Backend dependencies
├── server.js               # Express server entry point
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier formatting rules
│
├── routes/                 # API route definitions
│   ├── receipts.js         # Receipt endpoints
│   ├── users.js            # User management endpoints
│   ├── reports.js          # Report generation endpoints
│   ├── audit.js            # Audit mode endpoints
│   └── auth.js             # Authentication endpoints
│
├── controllers/            # Business logic
│   ├── receiptsController.js  # Receipt CRUD operations
│   ├── usersController.js     # User management
│   ├── reportsController.js   # Report generation
│   ├── auditController.js     # Audit operations
│   ├── authController.js      # Authentication logic
│   └── uploadController.js    # File upload handling
│
├── models/                 # Database models
│   ├── Receipt.js          # Receipt schema
│   ├── User.js             # User schema
│   ├── Report.js           # Report schema
│   └── AuditLog.js         # Audit log schema
│
├── middleware/             # Express middleware
│   ├── auth.js             # JWT authentication
│   ├── errorHandler.js     # Error handling
│   ├── logger.js           # Request logging
│   ├── validator.js        # Input validation
│   └── upload.js           # File upload handling
│
├── utils/                  # Utility functions
│   ├── helpers.js          # General helpers
│   ├── validators.js       # Validation functions
│   ├── constants.js        # Backend constants
│   ├── dateHelpers.js      # Date utilities
│   ├── logger.js           # Structured logging
│   ├── queue.js            # Job queue
│   └── cache.js            # Caching utilities
│
└── config/                 # Configuration files
    ├── database.js         # Database connection
    ├── ai.js               # AI service config
    └── ocr.js              # OCR engine config
```

---

## 🤖 AI Layer

```
ai/
├── prompts/                # GPT/Claude prompts
│   ├── receiptAnalysis.js  # Receipt data extraction prompts
│   ├── taxCompliance.js    # Tax compliance checking prompts
│   ├── riskScoring.js      # Risk scoring prompts
│   └── categorization.js   # Expense categorization prompts
│
├── rules/                  # Tax rules configuration
│   ├── us/                 # US tax rules
│   │   ├── taxRules.js     # General US tax rules
│   │   ├── federalRules.js # Federal tax regulations
│   │   └── stateRules.js   # State-specific rules
│   └── eu/                 # EU tax rules
│       ├── vatRules.js     # EU VAT regulations
│       └── countryRules.js # Country-specific rules
│
└── utils/                  # AI utilities
    ├── duplicateDetection.js # Duplicate receipt detection
    ├── riskScoring.js        # Risk calculation
    └── taxCalculator.js      # Tax calculation logic
```

---

## 📄 OCR Layer

```
ocr/
├── engines/                 # OCR engine configurations
│   ├── tesseract.js        # Tesseract OCR setup
│   └── alternative.js      # Alternative OCR engines (Google Vision, AWS Textract)
│
├── parsers/                 # Receipt parsers
│   ├── usReceiptParser.js  # US receipt format parser
│   └── euReceiptParser.js  # EU receipt format parser
│
└── utils/                   # OCR utilities
    ├── preprocessor.js     # Image preprocessing
    └── postprocessor.js    # OCR output cleaning
```

---

## 🗄️ Database

```
database/
├── schemas/                 # Database schema definitions
│   ├── receiptSchema.js    # Receipt schema
│   ├── userSchema.js       # User schema
│   └── reportSchema.js     # Report schema
│
├── migrations/              # Database migrations
│   ├── 001_initial_schema.js    # Initial database setup
│   └── 002_add_audit_logs.js    # Audit logs addition
│
└── seeders/                 # Sample data generators
    ├── receiptSeeder.js    # Test receipt data
    └── userSeeder.js       # Test user data
```

---

## 📊 Reports

```
reports/
└── templates/               # Export templates
    ├── csvTemplate.js      # CSV export format
    ├── pdfTemplate.js      # PDF export format
    ├── excelTemplate.js    # Excel export format
    └── auditTemplate.js    # Audit report format
```

---

## 💾 Storage

```
storage/
├── uploads/                 # Uploaded receipt files
│   └── .gitkeep
├── temp/                    # Temporary processing files
│   └── .gitkeep
└── processed/               # Processed receipt files
    └── .gitkeep
```

---

## ⚙️ Configuration

```
config/
├── backend.env.example      # Backend environment variables template
├── frontend.env.example     # Frontend environment variables template
└── ai.env.example           # AI service environment variables template
```

---

## 📚 Documentation

```
docs/
├── API.md                   # API endpoint documentation
├── ARCHITECTURE.md          # System architecture documentation
└── DEPLOYMENT.md            # Deployment guide
```

---

## 🧪 Tests

```
tests/
├── frontend/
│   ├── components.test.js   # Component unit tests
│   └── pages.test.js        # Page integration tests
├── backend/
│   ├── controllers.test.js  # Controller unit tests
│   └── routes.test.js       # Route integration tests
├── ai/
│   └── prompts.test.js      # AI prompt tests
└── ocr/
    └── parsers.test.js      # OCR parser tests
```

---

## 🔧 Scripts

```
scripts/
├── setup.sh                 # Development environment setup
├── migrate.js               # Database migration runner
├── seed.js                  # Database seeding
└── cleanup.js               # Temporary file cleanup
```

---

## 🚀 Deployment

```
deployment/
├── docker/
│   ├── Dockerfile           # Docker container definition
│   └── docker-compose.yml   # Multi-container setup
├── kubernetes/
│   └── deployment.yaml      # K8s deployment config
└── nginx/
    └── nginx.conf           # Nginx reverse proxy config
```

---

## 📝 Logs

```
logs/
└── .gitkeep                 # Application logs directory
```

---

## ✨ Key Features

- **Complete Frontend**: React.js with pages, components, services, and assets
- **Full Backend**: Express.js with routes, controllers, models, and middleware
- **AI Integration**: Prompts, tax rules (US + EU), and utility functions
- **OCR Processing**: Multiple engine support with US/EU parsers
- **Database**: Schemas, migrations, and seeders
- **Reports**: Multiple export formats (CSV, PDF, Excel)
- **Testing**: Comprehensive test structure
- **Deployment**: Docker, Kubernetes, and Nginx configurations
- **Documentation**: API, architecture, and deployment guides

---

## 🎯 Next Steps

1. Install dependencies: `npm run install:all`
2. Configure environment variables (see `config/*.env.example`)
3. Set up database connection
4. Run migrations: `npm run migrate`
5. Start development: `npm run dev`

---

**All files contain placeholder comments explaining their purpose. No actual code has been generated - only the structure and documentation.**

