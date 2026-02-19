import SearchResultCard from "./SearchResultCard.jsx";
export default function SearchResultList({ results, shelves, libraryKeys, onAdded }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {results.map((r) => (
        <SearchResultCard key={r.key} result={r} shelves={shelves} libraryKeys={libraryKeys} onAdded={onAdded} />
      ))}
    </div>
  );
}
