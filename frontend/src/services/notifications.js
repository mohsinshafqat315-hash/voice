// Notifications service - handles toast notifications and alerts
// Success, error, warning, info message display

import toast from 'react-hot-toast';

export const notifications = {
  /**
   * Show success notification
   */
  success(message, options = {}) {
    return toast.success(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options
    });
  },

  /**
   * Show error notification
   */
  error(message, options = {}) {
    return toast.error(message, {
      duration: options.duration || 5000,
      position: options.position || 'top-right',
      ...options
    });
  },

  /**
   * Show warning notification
   */
  warning(message, options = {}) {
    return toast(message, {
      icon: '⚠️',
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options
    });
  },

  /**
   * Show info notification
   */
  info(message, options = {}) {
    return toast(message, {
      icon: 'ℹ️',
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options
    });
  },

  /**
   * Show loading notification
   */
  loading(message, options = {}) {
    return toast.loading(message, {
      position: options.position || 'top-right',
      ...options
    });
  },

  /**
   * Dismiss notification
   */
  dismiss(toastId) {
    toast.dismiss(toastId);
  },

  /**
   * Show promise notification
   */
  promise(promise, messages) {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'An error occurred'
    });
  }
};

export default notifications;
