import React from 'react';
import { log, error } from '../../lib/debug';

/**
 * React Error Boundary component to catch JavaScript errors in child components
 * Prevents entire page crashes by showing fallback UI for failed sections
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    error('ErrorBoundary', `Caught error in ${this.props.label}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    log('ErrorBoundary', `Retrying ${this.props.label}`);
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise show default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI - small inline message that doesn't block the page
      return (
        <div className="bg-muted/10 border border-muted rounded-lg p-4 my-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                Section failed to load.
              </span>
            </div>
            <button
              onClick={this.handleRetry}
              className="text-xs text-primary hover:text-primary/80 underline ml-4"
              type="button"
            >
              Retry
            </button>
          </div>
          {this.props.label && (
            <p className="text-xs text-muted-foreground mt-1 opacity-70">
              {this.props.label}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;