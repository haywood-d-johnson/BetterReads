import { useState, useEffect } from "react";
import { getShelves, createShelf, updateShelf, deleteShelf } from "../api/shelves.js";
import ConfirmDialog from "../components/shared/ConfirmDialog.jsx";
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";

export default function ShelfManagementPage() {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  async function fetchShelves() {
    try {
      const data = await getShelves();
      setShelves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShelves();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    try {
      await createShelf(newName.trim());
      setNewName("");
      await fetchShelves();
      if (window.__refreshShelves) window.__refreshShelves();
    } catch (err) {
      setError(err.message || "Failed to create shelf");
    }
  }

  function startEdit(shelf) {
    setEditingId(shelf.id);
    setEditName(shelf.name);
  }

  async function handleRename(e) {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await updateShelf(editingId, editName.trim());
      setEditingId(null);
      await fetchShelves();
      if (window.__refreshShelves) window.__refreshShelves();
    } catch (err) {
      setError(err.message || "Failed to rename shelf");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteShelf(deleteTarget.id);
      setDeleteTarget(null);
      await fetchShelves();
      if (window.__refreshShelves) window.__refreshShelves();
    } catch (err) {
      setError(err.message || "Failed to delete shelf");
    }
  }

  if (loading) return <LoadingSpinner text="Loading shelves..." />;

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Manage Shelves</h1>

      {error && (
        <div
          style={{
            background: "rgba(231,76,60,0.1)",
            color: "var(--color-danger)",
            padding: "8px 16px",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          className="form-input"
          placeholder="New shelf name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={!newName.trim()}>
          Create Shelf
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {shelves.map((shelf) => (
          <div
            key={shelf.id}
            className="card"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}
          >
            {editingId === shelf.id ? (
              <form onSubmit={handleRename} style={{ display: "flex", gap: 8, flex: 1, marginRight: 8 }}>
                <input
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Save
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontWeight: 600 }}>{shelf.name}</span>
                  {shelf.is_default ? <span className="badge">Default</span> : null}
                  <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    {shelf.book_count || 0} books
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {!shelf.is_default && (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(shelf)}>
                        Rename
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                        onClick={() => setDeleteTarget(shelf)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Shelf"
          message={`Are you sure you want to delete "${deleteTarget.name}"? Books on this shelf will need to be moved first.`}
          confirmText="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
