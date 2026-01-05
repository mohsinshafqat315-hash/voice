// Migration script - runs database migrations
// Executes migration files in order, handles rollbacks

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

async function runMigrations() {
  await connectDB();
  
  const migrations = [
    require('../database/migrations/001_initial_schema'),
    require('../database/migrations/002_add_audit_logs')
  ];
  
  console.log('Running migrations...');
  
  for (let i = 0; i < migrations.length; i++) {
    try {
      console.log(`Running migration ${i + 1}...`);
      await migrations[i].up();
      console.log(`Migration ${i + 1} completed`);
    } catch (error) {
      console.error(`Migration ${i + 1} failed:`, error);
      throw error;
    }
  }
  
  console.log('All migrations completed successfully');
  await mongoose.connection.close();
  process.exit(0);
}

if (require.main === module) {
  runMigrations().catch(error => {
    console.error('Migration error:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations };
