import { useState } from "react";
import { updateReview } from "../../api/books.js";
import { useToast } from "../shared/Toast.jsx";
export default function ReviewForm({ bookId, initialReview = "", onUpdate, onSubmit, onCancel }) {
  const [review, setReview] = useState(initialReview);
  const [saving, setSaving] = useState(false);
  const addToast = useToast();
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (onSubmit) {
        await onSubmit(review);
      } else if (bookId) {
        const u = await updateReview(bookId, review);
        addToast("Review saved!", "success");
        if (onUpdate) onUpdate(u);
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        className="form-input"
        placeholder="Write your thoughts..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={4}
      />
      <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {onCancel && (
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Review"}
        </button>
      </div>
    </form>
  );
}
