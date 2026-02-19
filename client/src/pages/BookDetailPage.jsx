import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBook, updateRating, updateReview, updateReader, moveBookToShelf, deleteBook, updateLocation, removeLocation } from "../api/books.js";
import { getShelves } from "../api/shelves.js";
import BookCover from "../components/books/BookCover.jsx";
import StarRating from "../components/reviews/StarRating.jsx";
import ReviewForm from "../components/reviews/ReviewForm.jsx";
import ReviewDisplay from "../components/reviews/ReviewDisplay.jsx";
import ProgressUpdateForm from "../components/books/ProgressUpdateForm.jsx";
import ReadingProgressBar from "../components/books/ReadingProgressBar.jsx";
import ConfirmDialog from "../components/shared/ConfirmDialog.jsx";
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import ErrorMessage from "../components/shared/ErrorMessage.jsx";
import LocationDisplay from "../components/books/LocationDisplay.jsx";
import LocationPicker from "../components/books/LocationPicker.jsx";
import ReaderToggle from "../components/shared/ReaderToggle.jsx";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const fetchBook = useCallback(async () => {
    try {
      const [b, s] = await Promise.all([getBook(id), getShelves()]);
      setBook(b);
      console.log(b);
      setShelves(s);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load book");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  async function handleRating(rating) {
    try {
      await updateRating(id, rating);
      setBook((prev) => ({ ...prev, rating }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReviewSubmit(review) {
    try {
      await updateReview(id, review);
      setBook((prev) => ({ ...prev, review }));
      setShowReviewForm(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleShelfChange(e) {
    try {
      await moveBookToShelf(id, parseInt(e.target.value, 10));
      await fetchBook();
      if (window.__refreshShelves) window.__refreshShelves();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleProgressUpdate() {
    await fetchBook();
  }

  async function handleDelete() {
    try {
      await deleteBook(id);
      if (window.__refreshShelves) window.__refreshShelves();
      navigate("/library");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReaderChange(reader) {
    try {
      await updateReader(id, reader);
      setBook((prev) => ({ ...prev, reader }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleLocationConfirm(location) {
    try {
      await updateLocation(id, location.name, location.lat, location.lng);
      setBook((prev) => ({
        ...prev,
        location_name: location.name,
        location_lat: location.lat,
        location_lng: location.lng,
      }));
      setShowLocationPicker(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleLocationRemove() {
    try {
      await removeLocation(id);
      setBook((prev) => ({
        ...prev,
        location_name: null,
        location_lat: null,
        location_lng: null,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading book..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!book) return <ErrorMessage message="Book not found" />;

  const currentShelf = shelves.find((s) => s.id === book.shelf_id);
  const subjects = book.subjects ? JSON.parse(book.subjects) : [];

  return (
    <div>
      <Link
        to="/library"
        style={{
          color: "var(--color-accent)",
          textDecoration: "none",
          fontSize: "var(--font-size-sm)",
          display: "inline-block",
          marginBottom: 16,
        }}
      >
        &larr; Back to Library
      </Link>

      <div data-book-detail-layout style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, alignItems: "start" }}>
        <div>
          <BookCover coverId={book.cover_id} title={book.title} size="L" style={{ width: "100%", borderRadius: 8 }} />
          <div style={{ marginTop: 16 }}>
            <label
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Shelf
            </label>
            <select className="form-input" value={book.shelf_id} onChange={handleShelfChange} style={{ width: "100%" }}>
              {shelves.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 12 }}>
            <label
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Reader
            </label>
            <ReaderToggle value={book.reader || "me"} onChange={handleReaderChange} style={{ width: "100%" }} />
          </div>
          <button
            className="btn btn-sm"
            style={{ width: "100%", marginTop: 8, color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Remove from Library
          </button>
        </div>

        <div>
          <h1 style={{ marginBottom: 4 }}>{book.title}</h1>
          {book.subtitle && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-lg)", marginBottom: 8 }}>
              {book.subtitle}
            </p>
          )}
          {book.author_name && (
            <p style={{ fontSize: "var(--font-size-lg)", marginBottom: 16 }}>
              by{" "}
              {book.ol_author_key ? (
                <Link
                  to={`${book.ol_author_key.replaceAll("s", "")}`}
                  style={{ color: "var(--color-accent)", textDecoration: "none" }}
                >
                  {book.author_name}
                </Link>
              ) : (
                book.author_name
              )}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <StarRating rating={book.rating || 0} onChange={handleRating} size="lg" />
            {book.rating && <span style={{ color: "var(--color-text-muted)" }}>{book.rating} / 5</span>}
          </div>

          {(book.total_pages || book.current_page > 0) && (
            <div style={{ marginBottom: 24 }}>
              <ReadingProgressBar currentPage={book.current_page} totalPages={book.total_pages} />
              <ProgressUpdateForm
                bookId={book.id}
                currentPage={book.current_page}
                totalPages={book.total_pages}
                onUpdate={handleProgressUpdate}
              />
            </div>
          )}

          {book.description && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 8 }}>Description</h3>
              <p style={{ lineHeight: 1.6, color: "var(--color-text-light)" }}>
                {typeof book.description === "string" ? book.description : book.description?.value || ""}
              </p>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {book.number_of_pages && (
              <div>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Pages</span>
                <br />
                {book.number_of_pages}
              </div>
            )}
            {book.publish_date && (
              <div>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Published</span>
                <br />
                {book.publish_date}
              </div>
            )}
            {book.publisher && (
              <div>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Publisher</span>
                <br />
                {book.publisher}
              </div>
            )}
            {book.isbn_13 && (
              <div>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>ISBN</span>
                <br />
                {book.isbn_13}
              </div>
            )}
            {book.language && (
              <div>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Language</span>
                <br />
                {book.language}
              </div>
            )}
            {currentShelf && (
              <div>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Shelf</span>
                <br />
                {currentShelf.name}
              </div>
            )}
          </div>

          {subjects.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 8 }}>Subjects</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {subjects.slice(0, 15).map((s, i) => (
                  <span key={i} className="badge">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3>Location</h3>
              {!book.location_name && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowLocationPicker(true)}>
                  Set Location
                </button>
              )}
            </div>
            {book.location_name && book.location_lat != null && book.location_lng != null ? (
              <LocationDisplay
                locationName={book.location_name}
                lat={book.location_lat}
                lng={book.location_lng}
                onChangeClick={() => setShowLocationPicker(true)}
                onRemoveClick={handleLocationRemove}
              />
            ) : (
              <p style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>No location set.</p>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3>Review</h3>
              {!showReviewForm && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowReviewForm(true)}>
                  {book.review ? "Edit Review" : "Write Review"}
                </button>
              )}
            </div>
            {showReviewForm ? (
              <ReviewForm
                initialReview={book.review || ""}
                onSubmit={handleReviewSubmit}
                onCancel={() => setShowReviewForm(false)}
              />
            ) : book.review ? (
              <ReviewDisplay review={book.review} />
            ) : (
              <p style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>No review yet.</p>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Remove Book"
          message={`Are you sure you want to remove "${book.title}" from your library? This cannot be undone.`}
          confirmText="Remove"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onConfirm={handleLocationConfirm}
          initialLocation={
            book.location_name
              ? { name: book.location_name, lat: book.location_lat, lng: book.location_lng }
              : null
          }
        />
      )}
    </div>
  );
}
