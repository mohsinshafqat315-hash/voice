// Initial database migration - creates base tables/collections
// Sets up initial database structure for users, receipts, reports

const mongoose = require('mongoose');

async function up() {
  // This migration assumes collections are created automatically by Mongoose
  // when models are first used. We'll create indexes here.
  
  const db = mongoose.connection.db;
  
  // Create indexes for users collection
  const usersCollection = db.collection('users');
  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await usersCollection.createIndex({ 'subscription.plan': 1, 'subscription.status': 1 });
  
  // Create indexes for receipts collection
  const receiptsCollection = db.collection('receipts');
  await receiptsCollection.createIndex({ userId: 1, date: -1 });
  await receiptsCollection.createIndex({ userId: 1, status: 1 });
  await receiptsCollection.createIndex({ userId: 1, 'aiAnalysis.risk_level': 1 });
  await receiptsCollection.createIndex({ vendor: 1, date: 1, total: 1 });
  await receiptsCollection.createIndex({ invoice_number: 1 });
  
  // Create indexes for payments collection
  const paymentsCollection = db.collection('payments');
  await paymentsCollection.createIndex({ userId: 1, createdAt: -1 });
  await paymentsCollection.createIndex({ stripePaymentIntentId: 1 });
  await paymentsCollection.createIndex({ status: 1 });
  
  // Create indexes for reports collection
  const reportsCollection = db.collection('reports');
  await reportsCollection.createIndex({ userId: 1, createdAt: -1 });
  await reportsCollection.createIndex({ userId: 1, type: 1 });
  
  console.log('Migration 001: Initial schema indexes created');
}

async function down() {
  // Drop indexes (be careful in production)
  const db = mongoose.connection.db;
  
  try {
    await db.collection('users').dropIndexes();
    await db.collection('receipts').dropIndexes();
    await db.collection('payments').dropIndexes();
    await db.collection('reports').dropIndexes();
    console.log('Migration 001: Indexes dropped');
  } catch (error) {
    console.error('Error dropping indexes:', error);
  }
}

module.exports = { up, down };
