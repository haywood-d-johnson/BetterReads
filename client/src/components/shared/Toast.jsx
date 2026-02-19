import { useState, useCallback, createContext, useContext } from "react";
const ToastContext = createContext(null);
export function useToast() {
  return useContext(ToastContext);
}
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);
  const colors = { success: "var(--color-success)", error: "var(--color-danger)", info: "var(--color-info)" };
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              color: "white",
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              boxShadow: "var(--shadow-md)",
              cursor: "pointer",
              background: colors[t.type] || colors.success,
              maxWidth: 360,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
