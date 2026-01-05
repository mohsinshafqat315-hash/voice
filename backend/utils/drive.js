// Storage abstraction - file storage utility
// Abstracts file storage (local, S3, etc.)

const fs = require('fs');
const path = require('path');

class StorageDriver {
  constructor(config = {}) {
    this.basePath = config.basePath || process.env.UPLOAD_PATH || './storage/uploads';
    this.ensureDirectory();
  }
  
  ensureDirectory() {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }
  
  /**
   * Save file
   * @param {string} filename - Filename
   * @param {Buffer} buffer - File buffer
   * @returns {Promise<string>} File path
   */
  async save(filename, buffer) {
    const filePath = path.join(this.basePath, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }
  
  /**
   * Get file
   * @param {string} filename - Filename
   * @returns {Promise<Buffer>} File buffer
   */
  async get(filename) {
    const filePath = path.join(this.basePath, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    return fs.readFileSync(filePath);
  }
  
  /**
   * Delete file
   * @param {string} filename - Filename
   * @returns {Promise<void>}
   */
  async delete(filename) {
    const filePath = path.join(this.basePath, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  /**
   * Get file URL
   * @param {string} filename - Filename
   * @returns {string} File URL
   */
  getUrl(filename) {
    return `/uploads/${filename}`;
  }
  
  /**
   * Check if file exists
   * @param {string} filename - Filename
   * @returns {boolean} True if exists
   */
  exists(filename) {
    const filePath = path.join(this.basePath, filename);
    return fs.existsSync(filePath);
  }
}

// Create instance
const drive = new StorageDriver();

module.exports = drive;

