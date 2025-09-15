import React, { useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { log } from '../../lib/debug';

/**
 * Safe wrapper component that renders children within an ErrorBoundary
 * Logs lifecycle events for debugging and prevents component failures from breaking the page
 * 
 * @param {string} debugId - Unique identifier for debugging (e.g., "Dashboard:AssetChart")
 * @param {string} fallbackMessage - Optional custom message for error fallback
 * @param {React.ReactNode} children - Child components to render safely
 */
function SafeSection({ debugId, fallbackMessage, children }) {
  useEffect(() => {
    log(debugId, 'SafeSection mounted');
    
    return () => {
      log(debugId, 'SafeSection unmounted');
    };
  }, [debugId]);

  // Custom fallback that uses the same small inline message pattern
  const customFallback = fallbackMessage ? (
    <div className="bg-muted/10 border border-muted rounded-lg p-4 my-2">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 rounded-full bg-yellow-500 flex-shrink-0" />
        <span className="text-sm text-muted-foreground">
          {fallbackMessage}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 opacity-70">
        {debugId}
      </p>
    </div>
  ) : undefined;

  return (
    <ErrorBoundary 
      label={debugId} 
      fallback={customFallback}
    >
      {children}
    </ErrorBoundary>
  );
}

export default SafeSection;