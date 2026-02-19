import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuthor, getAuthorWorks } from "../api/authors.js";
import { getLibraryWorkKeys } from "../api/books.js";
import BookCover from "../components/books/BookCover.jsx";
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import ErrorMessage from "../components/shared/ErrorMessage.jsx";

function authorPhotoUrl(olid, size = "M") {
  return `https://covers.openlibrary.org/a/olid/${olid}-${size}.jpg?default=false`;
}

export default function AuthorPage() {
  const { olAuthorKey: authorKey } = useParams();
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [libraryKeys, setLibraryKeys] = useState(new Set());
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAuthor(authorKey), getAuthorWorks(authorKey), getLibraryWorkKeys()])
      .then(([a, w, keys]) => {
        setAuthor(a);
        setWorks(w.entries || []);
        setLibraryKeys(new Set(keys));
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load author");
      })
      .finally(() => setLoading(false));
  }, [authorKey]);

  if (loading) return <LoadingSpinner size="lg" text="Loading author..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!author) return <ErrorMessage message="Author not found" />;

  const bio = typeof author.bio === "string" ? author.bio : author.bio?.value || "";
  //console.log(typeof bio, bio);
  const bioIsLong = bio.length > 500;
  const displayBio = bioIsLong && !showFullBio ? bio.slice(0, 500) + "..." : bio;

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

      <div
        data-author-layout
        style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 32, alignItems: "start", marginBottom: 32 }}
      >
        <div>
          <img
            src={authorPhotoUrl(authorKey, "L")}
            alt={author.name}
            style={{ width: "100%", borderRadius: 8, background: "var(--color-surface)" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div>
          <h1 style={{ marginBottom: 8 }}>{author.name}</h1>
          {(author.birth_date || author.death_date) && (
            <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
              {author.birth_date || "?"} &ndash; {author.death_date || "present"}
            </p>
          )}
          {bio && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ lineHeight: 1.6, whiteSpace: "pre-line" }}>{displayBio}</p>
              {bioIsLong && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 8 }}
                  onClick={() => setShowFullBio(!showFullBio)}
                >
                  {showFullBio ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {works.length > 0 && (
        <section>
          <h2 style={{ marginBottom: 16 }}>Works ({works.length})</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
            {works.map((work) => {
              const workKey = work.key?.replace("/works/", "");
              const coverId = work.covers?.[0];
              const inLibrary = workKey && libraryKeys.has(workKey);
              return (
                <div key={work.key} className="card" style={{ padding: 12, textAlign: "center", position: "relative" }}>
                  {inLibrary && (
                    <span className="badge" style={{ position: "absolute", top: 6, right: 6, fontSize: 10 }}>
                      In Library
                    </span>
                  )}
                  <BookCover
                    coverId={coverId}
                    title={work.title}
                    size="M"
                    style={{ width: 100, height: 150, margin: "0 auto 8px", borderRadius: 4 }}
                  />
                  <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, lineHeight: 1.3 }}>{work.title}</p>
                  {work.first_publish_year && (
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {work.first_publish_year}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
