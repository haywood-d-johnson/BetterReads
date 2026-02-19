import { useState, useEffect, useCallback } from "react";
import { searchBooks } from "../api/search.js";
import { getLibraryWorkKeys } from "../api/books.js";
import { getShelves } from "../api/shelves.js";
import SearchBar from "../components/search/SearchBar.jsx";
import SearchResultList from "../components/search/SearchResultList.jsx";
import Pagination from "../components/shared/Pagination.jsx";
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [libraryKeys, setLibraryKeys] = useState(new Set());
  const [shelves, setShelves] = useState([]);
  const limit = 20;

  useEffect(() => {
    getLibraryWorkKeys()
      .then((keys) => setLibraryKeys(new Set(keys)))
      .catch(() => {});
    getShelves()
      .then(setShelves)
      .catch(() => {});
  }, []);

  const doSearch = useCallback(async (q, p) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchBooks({ q: q.trim(), page: p, limit });
      setResults(data.docs || data.results || []);
      setTotal(data.numFound || data.total || 0);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSearch(q) {
    setQuery(q);
    setPage(1);
    doSearch(q, 1);
  }

  function handlePageChange(p) {
    setPage(p);
    doSearch(query, p);
    window.scrollTo(0, 0);
  }

  function handleBookAdded(olWorkKey) {
    setLibraryKeys((prev) => new Set([...prev, olWorkKey]));
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Search Books</h1>
      <SearchBar onChange={handleSearch} />
      {loading ? (
        <LoadingSpinner text="Searching Open Library..." />
      ) : searched && results.length === 0 ? (
        <EmptyState
          icon={"\u{1F50D}"}
          title="No results found"
          message={`No books found for "${query}". Try a different search term.`}
        />
      ) : results.length > 0 ? (
        <>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 16, fontSize: "var(--font-size-sm)" }}>
            {total.toLocaleString()} results for &ldquo;{query}&rdquo;
          </p>
          <SearchResultList results={results} shelves={shelves} libraryKeys={libraryKeys} onAdded={handleBookAdded} />
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}
        </>
      ) : null}
    </div>
  );
}
