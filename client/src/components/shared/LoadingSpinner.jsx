export default function LoadingSpinner({ size = "md", text }) {
  const sizes = { sm: 20, md: 36, lg: 48 };
  const s = sizes[size] || 36;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 32,
      }}
    >
      <div
        style={{
          width: s,
          height: s,
          border: "3px solid var(--color-border-light)",
          borderTopColor: "var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      {text && <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{text}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
