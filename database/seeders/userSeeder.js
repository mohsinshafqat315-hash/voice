// User seeder - generates sample user data for development
// Creates test users with different roles and permissions

const User = require('../../backend/models/User');
const bcrypt = require('bcryptjs');
const logger = require('../../backend/utils/logger');

/**
 * Generate sample user data
 */
function generateUser(index, options = {}) {
  const names = [
    'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams',
    'Charlie Brown', 'Diana Prince', 'Edward Norton', 'Fiona Apple'
  ];
  
  const companies = [
    'Acme Corp', 'Tech Solutions Inc', 'Global Enterprises',
    'StartupXYZ', 'Business Partners LLC', null
  ];
  
  const countries = ['US', 'US', 'US', 'GB', 'DE', 'FR'];
  const currencies = ['USD', 'USD', 'USD', 'GBP', 'EUR', 'EUR'];
  const plans = ['free', 'pro', 'business', 'enterprise'];
  
  const name = options.name || names[index % names.length];
  const email = options.email || `user${index}@example.com`;
  const password = options.password || 'password123';
  const company = options.company !== undefined ? options.company : companies[index % companies.length];
  const country = options.country || countries[index % countries.length];
  const currency = options.currency || currencies[index % currencies.length];
  const plan = options.plan || plans[Math.floor(Math.random() * plans.length)];
  
  return {
    email,
    password,
    name,
    company,
    country,
    currency,
    role: options.role || 'user',
    subscription: {
      plan,
      status: plan === 'free' ? 'active' : Math.random() > 0.2 ? 'active' : 'trialing',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    settings: {
      notifications: {
        email: true,
        alerts: true
      },
      preferences: {
        theme: 'light',
        language: 'en'
      }
    }
  };
}

/**
 * Seed a single user
 * @param {Object} userData - User data
 */
async function seedUser(userData) {
  try {
    // Check if user already exists
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      logger.warn(`User ${userData.email} already exists`);
      return existing;
    }
    
    const user = await User.create(userData);
    logger.info(`Created user: ${user.email}`);
    return user;
  } catch (error) {
    logger.error('Error seeding user', { error: error.message, email: userData.email });
    throw error;
  }
}

/**
 * Seed multiple users
 * @param {number} count - Number of users to create
 */
async function seedUsers(count = 5) {
  try {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      const userData = generateUser(i);
      const user = await seedUser(userData);
      users.push(user);
    }
    
    logger.info(`Seeded ${users.length} users`);
    return users;
  } catch (error) {
    logger.error('Error seeding users', { error: error.message });
    throw error;
  }
}

/**
 * Seed admin user
 */
async function seedAdmin() {
  try {
    const adminData = generateUser(0, {
      email: 'admin@ledgersmart.ai',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      plan: 'enterprise'
    });
    
    const admin = await seedUser(adminData);
    logger.info('Admin user created/verified');
    return admin;
  } catch (error) {
    logger.error('Error seeding admin', { error: error.message });
    throw error;
  }
}

/**
 * Seed test user with known credentials
 */
async function seedTestUser() {
  try {
    const testUserData = generateUser(1, {
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User',
      plan: 'pro'
    });
    
    const testUser = await seedUser(testUserData);
    logger.info('Test user created/verified');
    return testUser;
  } catch (error) {
    logger.error('Error seeding test user', { error: error.message });
    throw error;
  }
}

/**
 * Clear all users (use with caution - keeps admin)
 */
async function clearUsers() {
  try {
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    logger.info(`Cleared ${result.deletedCount} users (kept admins)`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error clearing users', { error: error.message });
    throw error;
  }
}

module.exports = {
  seedUser,
  seedUsers,
  seedAdmin,
  seedTestUser,
  clearUsers,
  generateUser
};
