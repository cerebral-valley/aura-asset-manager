/**
 * Debug utilities for temporary diagnostic instrumentation
 * Remove after verification if desired
 */

/**
 * Check if debug mode is enabled via localStorage
 * @returns {boolean} true if debug mode is enabled
 */
export function debugOn() {
  try {
    return localStorage.getItem('debug') === 'true';
  } catch (error) {
    // In case localStorage is not available (SSR, etc.)
    return false;
  }
}

/**
 * Log message only if debug mode is enabled
 * @param {string} scope - Component or page name for scoping
 * @param {...any} args - Arguments to log
 */
export function log(scope, ...args) {
  if (debugOn()) {
    console.log(`[DEBUG:${scope}]`, ...args);
  }
}

/**
 * Log warning message with consistent prefix (always logs)
 * @param {string} scope - Component or page name for scoping
 * @param {...any} args - Arguments to log
 */
export function warn(scope, ...args) {
  console.warn(`[WARN:${scope}]`, ...args);
}

/**
 * Log error message with consistent prefix (always logs)
 * @param {string} scope - Component or page name for scoping
 * @param {...any} args - Arguments to log
 */
export function error(scope, ...args) {
  console.error(`[ERROR:${scope}]`, ...args);
}

/**
 * Helper to enable debug mode
 * Usage: debug.enable() or in console: localStorage.setItem('debug', 'true')
 */
export function enable() {
  localStorage.setItem('debug', 'true');
  console.log('[DEBUG] Debug mode enabled. Reload page to see debug logs.');
}

/**
 * Helper to disable debug mode
 * Usage: debug.disable() or in console: localStorage.removeItem('debug')
 */
export function disable() {
  localStorage.removeItem('debug');
  console.log('[DEBUG] Debug mode disabled. Reload page to stop debug logs.');
}

// Default export for convenience
const debug = {
  debugOn,
  log,
  warn,
  error,
  enable,
  disable
};

export default debug;