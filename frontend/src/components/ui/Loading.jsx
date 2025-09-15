import React from 'react';

/**
 * Unified, theme-aware Loading component
 * Provides consistent loading UX across all pages with proper accessibility
 * 
 * @param {string} pageName - Optional page name for message (e.g., "Dashboard")
 * @param {boolean} fullScreen - Whether to use full screen height (default: false)
 * @param {string} messageOverride - Optional custom loading message
 */
function Loading({ pageName, fullScreen = false, messageOverride }) {
  // Message priority: messageOverride > "Loading Your {pageName}" > "Loading…"
  const getMessage = () => {
    if (messageOverride) {
      return messageOverride;
    }
    if (pageName) {
      return `Loading Your ${pageName}`;
    }
    return "Loading…";
  };

  // Layout classes based on fullScreen prop
  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-background"
    : "min-h-[60vh] flex items-center justify-center bg-background";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Spinner with accessibility attributes */}
        <div 
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"
          role="status"
          aria-live="polite"
          aria-label="Loading content"
        >
          {/* Visually hidden label for screen readers */}
          <span className="sr-only">Loading content, please wait...</span>
        </div>
        
        {/* Loading message */}
        <p className="mt-3 text-muted-foreground text-sm">
          {getMessage()}
        </p>
      </div>
    </div>
  );
}

export default Loading;