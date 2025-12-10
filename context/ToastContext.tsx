import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none max-w-[90vw] md:max-w-md w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transform transition-all animate-slide-in hover:scale-[1.02] ${
              toast.type === 'error'
                ? 'bg-red-50/90 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-100'
                : toast.type === 'success'
                ? 'bg-emerald-50/90 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-100'
                : toast.type === 'warning'
                ? 'bg-amber-50/90 dark:bg-amber-900/90 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-100'
                : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />}
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
            </div>
            
            <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
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