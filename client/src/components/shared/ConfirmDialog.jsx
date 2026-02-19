export default function ConfirmDialog({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-floral-bg"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-bg-card)",
          borderRadius: 12,
          padding: 24,
          maxWidth: 420,
          width: "90%",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <h3 style={{ marginBottom: 8 }}>{title}</h3>
        <p style={{ color: "var(--color-text-light)", marginBottom: 24, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
