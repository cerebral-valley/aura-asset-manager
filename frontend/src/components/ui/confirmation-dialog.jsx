import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "danger", // "danger" | "warning" | "info"
  asset = null
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      button: "bg-red-600 hover:bg-red-700 text-white"
    },
    warning: {
      bg: "bg-yellow-50", 
      border: "border-yellow-200",
      icon: "text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white"
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200", 
      icon: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 text-white"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${styles.bg} ${styles.border} border-2 rounded-lg max-w-md w-full p-6 relative`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-700 mb-3">{message}</p>
          
          {asset && (
            <div className="bg-white border border-gray-200 rounded-md p-3">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-1">Asset Details:</div>
                <div className="text-gray-600">
                  <div><strong>Name:</strong> {asset.name}</div>
                  <div><strong>Type:</strong> {asset.asset_type}</div>
                  <div><strong>Current Value:</strong> ${asset.current_value?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ This action cannot be undone. All transaction history for this asset will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md transition-colors ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
