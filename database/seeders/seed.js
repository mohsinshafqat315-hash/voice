// Main seeder script - populates database with sample data
// Creates test users, receipts, and payment records

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../../backend/models/User');
const Receipt = require('../../backend/models/Receipt');
const Payment = require('../../backend/models/Payment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      email: 'admin@ledgersmart.ai',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'admin',
      subscription: {
        plan: 'enterprise',
        status: 'active'
      }
    },
    {
      email: 'user@example.com',
      password: await bcrypt.hash('user123', 10),
      name: 'Test User',
      subscription: {
        plan: 'pro',
        status: 'active',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123'
      }
    },
    {
      email: 'free@example.com',
      password: await bcrypt.hash('free123', 10),
      name: 'Free User',
      subscription: {
        plan: 'free',
        status: 'active'
      }
    }
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log('Users seeded:', createdUsers.length);
  return createdUsers;
};

const seedReceipts = async (users) => {
  const receipts = [];
  
  users.forEach((user, userIndex) => {
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      
      receipts.push({
        userId: user._id,
        vendor: `Vendor ${i + 1}`,
        date: date,
        total: Math.random() * 500 + 10,
        tax: Math.random() * 50 + 1,
        currency: userIndex === 0 ? 'EUR' : 'USD',
        VAT_ID: userIndex === 0 ? 'DE123456789' : undefined,
        invoice_number: `INV-${userIndex}-${i}`,
        status: i % 2 === 0 ? 'approved' : 'pending',
        aiAnalysis: {
          risk_score: Math.random() * 100,
          risk_level: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
          alerts: Math.random() > 0.7 ? ['Possible duplicate detected'] : [],
          confidence_score: 0.8 + Math.random() * 0.2,
          compliance_status: 'compliant',
          requires_review: Math.random() > 0.8
        },
        ocrData: {
          rawText: 'Sample OCR text',
          confidence: 0.85,
          processedAt: new Date()
        }
      });
    }
  });

  await Receipt.deleteMany({});
  const createdReceipts = await Receipt.insertMany(receipts);
  console.log('Receipts seeded:', createdReceipts.length);
  return createdReceipts;
};

const seedPayments = async (users) => {
  const payments = [];
  
  users.forEach((user) => {
    if (user.subscription.plan !== 'free') {
      payments.push({
        userId: user._id,
        type: 'subscription',
        amount: user.subscription.plan === 'pro' ? 15 : user.subscription.plan === 'business' ? 29 : 79,
        currency: 'USD',
        status: 'completed',
        plan: user.subscription.plan,
        stripeSubscriptionId: user.subscription.stripeSubscriptionId || 'sub_test',
        billingPeriod: {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
  });

  await Payment.deleteMany({});
  const createdPayments = await Payment.insertMany(payments);
  console.log('Payments seeded:', createdPayments.length);
  return createdPayments;
};

const seed = async () => {
  try {
    await connectDB();
    
    console.log('Starting seed...');
    const users = await seedUsers();
    const receipts = await seedReceipts(users);
    const payments = await seedPayments(users);
    
    console.log('Seed completed successfully!');
    console.log(`- Users: ${users.length}`);
    console.log(`- Receipts: ${receipts.length}`);
    console.log(`- Payments: ${payments.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seed();
}

module.exports = { seed };

