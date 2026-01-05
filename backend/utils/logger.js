// Logger utility - structured logging with Winston or similar
// Log levels, file rotation, error tracking

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
    this.enableFileLogging = process.env.ENABLE_FILE_LOGGING !== 'false';
  }
  
  _shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }
  
  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }
  
  _writeToFile(level, message, meta) {
    if (!this.enableFileLogging) return;
    
    const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
    const formatted = this._formatMessage(level, message, meta) + '\n';
    
    fs.appendFile(logFile, formatted, (err) => {
      if (err) console.error('Failed to write to log file:', err);
    });
  }
  
  error(message, meta = {}) {
    if (!this._shouldLog('ERROR')) return;
    const formatted = this._formatMessage('ERROR', message, meta);
    console.error(formatted);
    this._writeToFile('ERROR', message, meta);
  }
  
  warn(message, meta = {}) {
    if (!this._shouldLog('WARN')) return;
    const formatted = this._formatMessage('WARN', message, meta);
    console.warn(formatted);
    this._writeToFile('WARN', message, meta);
  }
  
  info(message, meta = {}) {
    if (!this._shouldLog('INFO')) return;
    const formatted = this._formatMessage('INFO', message, meta);
    console.log(formatted);
    this._writeToFile('INFO', message, meta);
  }
  
  debug(message, meta = {}) {
    if (!this._shouldLog('DEBUG')) return;
    const formatted = this._formatMessage('DEBUG', message, meta);
    console.log(formatted);
    this._writeToFile('DEBUG', message, meta);
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
