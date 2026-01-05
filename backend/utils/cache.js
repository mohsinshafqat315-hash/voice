// Cache utility - in-memory cache with TTL
// Caches frequently accessed data, session management

class Cache {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
  }
  
  /**
   * Set cache value with TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = 3600000) { // Default 1 hour
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // Set value
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
    
    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
  }
  
  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.store.delete(key);
  }
  
  /**
   * Clear all cache
   */
  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.store.clear();
  }
  
  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {boolean} True if exists and not expired
   */
  has(key) {
    return this.get(key) !== null;
  }
  
  /**
   * Get cache size
   * @returns {number} Number of entries
   */
  size() {
    return this.store.size;
  }
}

// Create singleton instance
const cache = new Cache();

module.exports = cache;
