// Receipt seeder - generates sample receipt data for development
// Creates test receipts with various categories, amounts, dates

const Receipt = require('../../backend/models/Receipt');
const User = require('../../backend/models/User');
const logger = require('../../backend/utils/logger');

/**
 * Generate random date within range
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate sample receipt data
 */
function generateReceipt(userId, index) {
  const vendors = [
    'Amazon', 'Starbucks', 'Uber', 'Airbnb', 'Office Depot',
    'Whole Foods', 'Shell', 'Target', 'Walmart', 'Best Buy',
    'Home Depot', 'CVS Pharmacy', 'McDonald\'s', 'Subway', 'FedEx'
  ];
  
  const categories = [
    'Office Supplies', 'Travel', 'Meals', 'Software', 'Hardware',
    'Utilities', 'Marketing', 'Professional Services', 'Transportation'
  ];
  
  const currencies = ['USD', 'EUR', 'PKR'];
  const riskLevels = ['Low', 'Medium', 'High'];
  
  const date = randomDate(new Date(2024, 0, 1), new Date());
  const vendor = vendors[Math.floor(Math.random() * vendors.length)];
  const total = parseFloat((Math.random() * 1000 + 10).toFixed(2));
  const tax = parseFloat((total * 0.1).toFixed(2));
  const currency = currencies[Math.floor(Math.random() * currencies.length)];
  const riskScore = Math.floor(Math.random() * 100);
  const riskLevel = riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low';
  
  const receipt = {
    userId,
    vendor,
    date,
    total,
    tax,
    currency,
    invoice_number: `INV-${Date.now()}-${index}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    status: Math.random() > 0.7 ? 'approved' : Math.random() > 0.5 ? 'pending' : 'flagged',
    ocrData: {
      rawText: `Receipt from ${vendor}\nDate: ${date.toLocaleDateString()}\nTotal: ${currency} ${total}`,
      confidence: 0.85 + Math.random() * 0.15,
      processedAt: date
    },
    aiAnalysis: {
      risk_score: riskScore,
      risk_level: riskLevel,
      alerts: riskScore > 60 ? ['High risk detected', 'Requires manual review'] : [],
      suggested_corrections: [],
      confidence_score: 0.7 + Math.random() * 0.3,
      compliance_status: riskScore < 30 ? 'Compliant' : riskScore < 60 ? 'Review Required' : 'Non-Compliant',
      requires_review: riskScore > 50
    }
  };
  
  // Add VAT ID for EUR receipts
  if (currency === 'EUR' && Math.random() > 0.3) {
    receipt.VAT_ID = `EU${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
  }
  
  return receipt;
}

/**
 * Seed receipts for a user
 * @param {string} userId - User ID
 * @param {number} count - Number of receipts to create
 */
async function seedReceipts(userId, count = 20) {
  try {
    const receipts = [];
    
    for (let i = 0; i < count; i++) {
      receipts.push(generateReceipt(userId, i));
    }
    
    await Receipt.insertMany(receipts);
    logger.info(`Seeded ${count} receipts for user ${userId}`);
    
    return receipts.length;
  } catch (error) {
    logger.error('Error seeding receipts', { error: error.message, userId });
    throw error;
  }
}

/**
 * Seed receipts for all users
 */
async function seedAllReceipts() {
  try {
    const users = await User.find({});
    
    if (users.length === 0) {
      logger.warn('No users found. Please seed users first.');
      return;
    }
    
    let totalReceipts = 0;
    
    for (const user of users) {
      const count = Math.floor(Math.random() * 30) + 10; // 10-40 receipts per user
      const created = await seedReceipts(user._id, count);
      totalReceipts += created;
    }
    
    logger.info(`Seeded ${totalReceipts} receipts for ${users.length} users`);
    return totalReceipts;
  } catch (error) {
    logger.error('Error seeding all receipts', { error: error.message });
    throw error;
  }
}

/**
 * Clear all receipts (use with caution)
 */
async function clearReceipts() {
  try {
    const result = await Receipt.deleteMany({});
    logger.info(`Cleared ${result.deletedCount} receipts`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error clearing receipts', { error: error.message });
    throw error;
  }
}

module.exports = {
  seedReceipts,
  seedAllReceipts,
  clearReceipts,
  generateReceipt
};
