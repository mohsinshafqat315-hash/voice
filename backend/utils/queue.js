// Queue utility - job queue for async processing
// Handles OCR processing, AI analysis, report generation queues

const EventEmitter = require('events');
const logger = require('./logger');

/**
 * Simple in-memory job queue
 * For production, consider using Redis Bull or similar
 */
class JobQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.queue = [];
    this.processing = false;
    this.maxConcurrency = options.maxConcurrency || 3;
    this.activeJobs = 0;
    this.failedJobs = [];
    this.completedJobs = [];
  }

  /**
   * Add job to queue
   * @param {Object} job - Job object with type, data, and handler
   * @returns {Promise} Job promise
   */
  async add(job) {
    return new Promise((resolve, reject) => {
      const jobEntry = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: job.type,
        data: job.data,
        handler: job.handler,
        priority: job.priority || 0,
        retries: job.retries || 3,
        retryDelay: job.retryDelay || 1000,
        createdAt: new Date(),
        resolve,
        reject
      };

      // Insert based on priority (higher priority first)
      const insertIndex = this.queue.findIndex(q => q.priority < jobEntry.priority);
      if (insertIndex === -1) {
        this.queue.push(jobEntry);
      } else {
        this.queue.splice(insertIndex, 0, jobEntry);
      }

      logger.info('Job added to queue', {
        jobId: jobEntry.id,
        type: jobEntry.type,
        queueLength: this.queue.length
      });

      this.emit('job:added', jobEntry);
      this.process();
    });
  }

  /**
   * Process queue
   */
  async process() {
    if (this.processing || this.activeJobs >= this.maxConcurrency) {
      return;
    }

    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeJobs < this.maxConcurrency) {
      const job = this.queue.shift();
      this.activeJobs++;

      this.executeJob(job).catch(error => {
        logger.error('Job execution error', {
          jobId: job.id,
          error: error.message
        });
      });
    }

    this.processing = false;
  }

  /**
   * Execute a job
   * @param {Object} job - Job entry
   */
  async executeJob(job) {
    const startTime = Date.now();
    
    try {
      logger.info('Executing job', {
        jobId: job.id,
        type: job.type
      });

      this.emit('job:started', job);

      // Execute job handler
      const result = await job.handler(job.data);

      const duration = Date.now() - startTime;

      logger.info('Job completed', {
        jobId: job.id,
        type: job.type,
        duration
      });

      this.completedJobs.push({
        ...job,
        completedAt: new Date(),
        duration,
        result
      });

      this.emit('job:completed', { job, result, duration });
      job.resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;

      // Retry logic
      if (job.retries > 0) {
        job.retries--;
        logger.warn('Job failed, retrying', {
          jobId: job.id,
          type: job.type,
          retriesLeft: job.retries,
          error: error.message
        });

        // Re-add to queue with delay
        setTimeout(() => {
          this.queue.unshift(job);
          this.process();
        }, job.retryDelay);

        this.emit('job:retry', { job, error, retriesLeft: job.retries });
      } else {
        logger.error('Job failed permanently', {
          jobId: job.id,
          type: job.type,
          error: error.message,
          duration
        });

        this.failedJobs.push({
          ...job,
          failedAt: new Date(),
          duration,
          error: error.message
        });

        this.emit('job:failed', { job, error });
        job.reject(error);
      }
    } finally {
      this.activeJobs--;
      this.process(); // Process next job
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      activeJobs: this.activeJobs,
      completedJobs: this.completedJobs.length,
      failedJobs: this.failedJobs.length,
      maxConcurrency: this.maxConcurrency
    };
  }

  /**
   * Clear completed jobs (keep last N)
   */
  clearCompleted(keepLast = 100) {
    if (this.completedJobs.length > keepLast) {
      this.completedJobs = this.completedJobs.slice(-keepLast);
    }
  }

  /**
   * Clear failed jobs (keep last N)
   */
  clearFailed(keepLast = 50) {
    if (this.failedJobs.length > keepLast) {
      this.failedJobs = this.failedJobs.slice(-keepLast);
    }
  }
}

// Create singleton instances for different job types
const ocrQueue = new JobQueue({ maxConcurrency: 2 });
const aiQueue = new JobQueue({ maxConcurrency: 3 });
const reportQueue = new JobQueue({ maxConcurrency: 1 });

// Cleanup old jobs periodically
setInterval(() => {
  ocrQueue.clearCompleted();
  aiQueue.clearCompleted();
  reportQueue.clearCompleted();
  ocrQueue.clearFailed();
  aiQueue.clearFailed();
  reportQueue.clearFailed();
}, 3600000); // Every hour

module.exports = {
  JobQueue,
  ocrQueue,
  aiQueue,
  reportQueue
};
