import { useState } from "react";
import { updateProgress } from "../../api/books.js";
import { useToast } from "../shared/Toast.jsx";
export default function ProgressUpdateForm({ bookId, currentPage, totalPages, onUpdate }) {
  const [page, setPage] = useState(currentPage || 0);
  const [saving, setSaving] = useState(false);
  const addToast = useToast();
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const u = await updateProgress(bookId, Number(page));
      addToast("Progress updated!", "success");
      if (onUpdate) onUpdate(u);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <label style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-light)" }}>Page:</label>
      <input
        type="number"
        className="form-input"
        style={{ width: 80 }}
        min={0}
        max={totalPages || 9999}
        value={page}
        onChange={(e) => setPage(e.target.value)}
      />
      {totalPages && (
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>/ {totalPages}</span>
      )}
      <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
        {saving ? "..." : "Update"}
      </button>
    </form>
  );
}
