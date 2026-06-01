import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ToastState {
  message: string;
  type: 'error' | 'success';
}

interface ToastContextValue {
  showToast: (message: string, type?: 'error' | 'success') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const closeToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de um ToastProvider');
  return context;
}

interface ToastProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  const isError = type === 'error';

  const colorClass = isError
    ? 'border-rose-500/40 text-rose-400'
    : 'border-emerald-500/40 text-emerald-400';

  const barClass = isError ? 'bg-rose-500' : 'bg-emerald-500';
  const icon     = isError ? 'fa-triangle-exclamation' : 'fa-circle-check';

  return (
    <div className={`fixed top-4 right-4 z-[9999] w-full max-w-sm rounded-xl border shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300 bg-zinc-950 ${colorClass}`}>
      <div className={`h-0.5 w-full ${barClass} opacity-60`} />
      <div className="flex items-start gap-3 p-4">
        <i className={`fa-solid ${icon} mt-0.5 shrink-0`}></i>
        <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
        <button
          onClick={onClose}
          className="text-current opacity-50 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}