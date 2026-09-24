import { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from './ToastContext.js';
import Icon from '../components/Icon.jsx';

const BORDER = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  info: 'border-l-indigo-500',
};

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-l-4 border-slate-200 bg-white p-3 shadow-lg ${BORDER[t.type]}`}
          >
            <p className="flex-1 text-sm text-slate-700">{t.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-600"
              onClick={() => dismiss(t.id)}
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}