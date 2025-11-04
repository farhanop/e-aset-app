// frontend/src/components/Toast.tsx
import React from "react";
import { useToast } from "../hooks/useToast";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg shadow-lg min-w-80 max-w-md transform transition-all duration-300 ${getToastStyles(
            toast.type
          )}`}
        >
          <span className="flex-shrink-0 w-5 h-5 mr-3 flex items-center justify-center">
            {getIcon(toast.type)}
          </span>
          <span className="flex-grow">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-3 text-lg font-bold hover:opacity-70"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
