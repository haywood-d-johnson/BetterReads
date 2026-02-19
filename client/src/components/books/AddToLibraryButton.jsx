import { useState } from "react";
import { addBook } from "../../api/books.js";
import { useToast } from "../shared/Toast.jsx";
import ReaderToggle from "../shared/ReaderToggle.jsx";
export default function AddToLibraryButton({ bookData, shelves, inLibrary, onAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reader, setReader] = useState("me");
  const addToast = useToast();
  if (inLibrary) return <span className="badge badge-success">In Library</span>;
  async function handleAdd(shelfId) {
    setLoading(true);
    try {
      await addBook({ ...bookData, shelf_id: shelfId, reader });
      addToast("Book added!", "success");
      setOpen(false);
      if (window.__refreshShelves) window.__refreshShelves();
      if (onAdded) onAdded();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn btn-accent btn-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        disabled={loading}
      >
        {loading ? "..." : "+ Add"}
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            boxShadow: "var(--shadow-md)",
            minWidth: 180,
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 16px",
              borderBottom: "1px solid var(--color-border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Reader</span>
            <ReaderToggle value={reader} onChange={setReader} />
          </div>
          {shelves.map((s) => (
            <button
              key={s.id}
              onClick={() => handleAdd(s.id)}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 16px",
                textAlign: "left",
                border: "none",
                background: "none",
                fontSize: "var(--font-size-sm)",
                cursor: "pointer",
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
