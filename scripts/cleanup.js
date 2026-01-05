// Cleanup script - removes temporary files and old data
// Cleans temp storage, old logs, expired sessions

const fs = require('fs');
const path = require('path');
const logger = require('../backend/utils/logger');

/**
 * Clean temporary files
 */
function cleanTempFiles() {
  const tempDir = path.join(process.cwd(), 'storage', 'temp');
  
  if (!fs.existsSync(tempDir)) {
    return 0;
  }
  
  let deletedCount = 0;
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  try {
    const files = fs.readdirSync(tempDir);
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile() && (now - stats.mtimeMs) > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    logger.info(`Cleaned ${deletedCount} temporary files`);
    return deletedCount;
  } catch (error) {
    logger.error('Error cleaning temp files', { error: error.message });
    return 0;
  }
}

/**
 * Clean old log files
 */
function cleanOldLogs() {
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logsDir)) {
    return 0;
  }
  
  let deletedCount = 0;
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  try {
    const files = fs.readdirSync(logsDir);
    
    files.forEach(file => {
      if (file.endsWith('.log')) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if ((now - stats.mtimeMs) > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    });
    
    logger.info(`Cleaned ${deletedCount} old log files`);
    return deletedCount;
  } catch (error) {
    logger.error('Error cleaning logs', { error: error.message });
    return 0;
  }
}

/**
 * Clean orphaned upload files
 */
async function cleanOrphanedUploads() {
  const uploadsDir = path.join(process.cwd(), 'storage', 'uploads');
  const Receipt = require('../backend/models/Receipt');
  
  if (!fs.existsSync(uploadsDir)) {
    return 0;
  }
  
  try {
    // Get all receipt file URLs
    const receipts = await Receipt.find({ fileUrl: { $exists: true } }).select('fileUrl');
    const validFiles = new Set(receipts.map(r => r.fileUrl.replace('/uploads/', '')));
    
    const files = fs.readdirSync(uploadsDir);
    let deletedCount = 0;
    
    files.forEach(file => {
      if (!validFiles.has(file)) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        // Only delete if old enough (in case receipt is being created)
        if ((Date.now() - stats.mtimeMs) > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    });
    
    logger.info(`Cleaned ${deletedCount} orphaned upload files`);
    return deletedCount;
  } catch (error) {
    logger.error('Error cleaning orphaned uploads', { error: error.message });
    return 0;
  }
}

/**
 * Run all cleanup tasks
 */
async function runCleanup() {
  logger.info('Starting cleanup process...');
  
  const results = {
    tempFiles: cleanTempFiles(),
    oldLogs: cleanOldLogs(),
    orphanedUploads: await cleanOrphanedUploads()
  };
  
  const total = Object.values(results).reduce((sum, count) => sum + count, 0);
  
  logger.info('Cleanup completed', {
    ...results,
    total
  });
  
  return results;
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../backend/config/database');
  
  connectDB().then(() => {
    runCleanup().then(() => {
      process.exit(0);
    }).catch(error => {
      logger.error('Cleanup failed', { error: error.message });
      process.exit(1);
    });
  });
}

module.exports = {
  cleanTempFiles,
  cleanOldLogs,
  cleanOrphanedUploads,
  runCleanup
};
