// Audit logs migration - adds audit logging tables/collections
// Creates audit log structure for tracking changes and actions

const mongoose = require('mongoose');

async function up() {
  const db = mongoose.connection.db;
  
  // Create indexes for auditlogs collection
  const auditLogsCollection = db.collection('auditlogs');
  await auditLogsCollection.createIndex({ userId: 1, createdAt: -1 });
  await auditLogsCollection.createIndex({ action: 1, createdAt: -1 });
  await auditLogsCollection.createIndex({ entityType: 1, entityId: 1 });
  await auditLogsCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year TTL
  
  console.log('Migration 002: Audit logs indexes created');
}

async function down() {
  const db = mongoose.connection.db;
  
  try {
    await db.collection('auditlogs').dropIndexes();
    console.log('Migration 002: Audit logs indexes dropped');
  } catch (error) {
    console.error('Error dropping audit log indexes:', error);
  }
}

module.exports = { up, down };
