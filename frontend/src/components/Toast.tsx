import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Kind = 'success' | 'error' | 'info';
interface Item { id: number; kind: Kind; msg: string }

const ToastCtx = createContext<{ push: (kind: Kind, msg: string) => void }>({ push: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const push = useCallback((kind: Kind, msg: string) => {
    const id = Date.now() + Math.random();
    setItems((cur) => [...cur, { id, kind, msg }]);
    setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== id)), 5000);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((i) => (
          <div key={i.id} className={`toast toast-${i.kind}`}>{i.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
