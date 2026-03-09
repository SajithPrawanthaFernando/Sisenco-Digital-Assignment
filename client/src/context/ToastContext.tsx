"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastContextType {
  showToast: (message: string, type: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  const el = useRef(null);

  const close = useCallback(() => {
    gsap.to(el.current, {
      x: 100,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: onRemove,
    });
  }, [onRemove]);

  useGSAP(() => {
    gsap.fromTo(
      el.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" },
    );

    const timer = setTimeout(close, 4000);
    return () => clearTimeout(timer);
  }, [close]);

  return (
    <div
      ref={el}
      className={`flex items-center justify-between gap-4 min-w-[320px] p-4 rounded-2xl shadow-2xl border pointer-events-auto backdrop-blur-xl ${
        toast.type === "success"
          ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400 shadow-emerald-900/20"
          : "bg-red-950/80 border-red-500/30 text-red-400 shadow-red-900/20"
      }`}
    >
      <div className="flex items-center gap-3">
        {toast.type === "success" ? (
          <CheckCircle2 size={20} />
        ) : (
          <XCircle size={20} />
        )}
        <span className="text-sm font-medium text-white">{toast.message}</span>
      </div>
      <button
        onClick={close}
        className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
