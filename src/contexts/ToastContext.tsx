import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast } from "../components/Toast";

export type ToastType = "success" | "error" | "info" | "warn";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  position?: "top" | "bottom";
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, position?: "top" | "bottom") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (type: ToastType, message: string, position: "top" | "bottom" = "top") => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, type, message, position }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          position={toast.position || "top"}
          onClose={removeToast}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
