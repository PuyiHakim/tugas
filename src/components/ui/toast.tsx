"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { IconButton } from "@/components/ui/button";
import { X } from "lucide-react";

type ToastMessage = { id: number; title: string; description?: string; tone: "success" | "error" | "info" };
type ToastApi = { toast: (title: string, description?: string, tone?: ToastMessage["tone"]) => void };
const ToastContext = createContext<ToastApi>({ toast: () => undefined });

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const toast = useCallback((title: string, description?: string, tone: ToastMessage["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setMessages((items) => [...items, { id, title, description, tone }]);
    window.setTimeout(() => setMessages((items) => items.filter((item) => item.id !== id)), 6000);
  }, []);
  const dismiss = (id: number) => setMessages((items) => items.filter((item) => item.id !== id));
  return <ToastContext.Provider value={{ toast }}>{children}<div className="toast-region" aria-live="polite" aria-relevant="additions text">{messages.map((item) => <div className={`toast toast--${item.tone}`} role={item.tone === "error" ? "alert" : "status"} key={item.id}><span className="toast-mark" aria-hidden="true">{item.tone === "error" ? "!" : item.tone === "success" ? "✓" : "i"}</span><div><strong>{item.title}</strong>{item.description && <p>{item.description}</p>}</div><IconButton type="button" aria-label="Dismiss notification" onClick={() => dismiss(item.id)}><X size={15} /></IconButton></div>)}</div></ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext);
