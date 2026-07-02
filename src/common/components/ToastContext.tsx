import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ToastMessage } from '@common/components/ToastContainer';

interface ToastContextType {
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
  showSnackbar: (
    message: string,
    actionLabel: string,
    onActionPress: () => void,
    type?: ToastMessage['type']
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const showSnackbar = useCallback(
    (message: string, actionLabel: string, onActionPress: () => void, type: ToastMessage['type'] = 'info') => {
      const id = Date.now().toString() + Math.random().toString();
      setToasts(prev => [
        ...prev,
        {
          id,
          message,
          type,
          duration: 5000, // Snackbars show longer
          action: { label: actionLabel, onPress: onActionPress },
        },
      ]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSnackbar }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
