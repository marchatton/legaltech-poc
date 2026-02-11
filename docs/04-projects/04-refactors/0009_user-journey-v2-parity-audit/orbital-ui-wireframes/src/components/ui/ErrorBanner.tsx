import React from 'react';
import { AlertTriangle, RefreshCw, LifeBuoy } from 'lucide-react';
interface ErrorBannerProps {
  code: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}
export function ErrorBanner({
  code,
  message,
  onRetry,
  className = ''
}: ErrorBannerProps) {
  return (
    <div
      className={`bg-destructive-50 border border-destructive-200 rounded-lg p-4 flex items-start ${className}`}>

      <AlertTriangle className="w-5 h-5 text-destructive-600 mt-0.5 flex-shrink-0" />
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-destructive-800">
          Operation Failed
        </h3>
        <div className="mt-1 text-sm text-destructive-700">
          {message}{' '}
          <span className="font-mono text-xs ml-1 opacity-75">[{code}]</span>
        </div>
        <div className="mt-3 flex space-x-4">
          {onRetry &&
          <button
            onClick={onRetry}
            className="inline-flex items-center text-xs font-medium text-destructive-800 hover:text-destructive-900">

              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </button>
          }
          <button className="inline-flex items-center text-xs font-medium text-destructive-800 hover:text-destructive-900">
            <LifeBuoy className="w-3.5 h-3.5 mr-1.5" />
            Contact Support
          </button>
        </div>
      </div>
    </div>);

}