import BookCard from "./BookCard.jsx";
export default function BookGrid({ books }) {
  return (
    <div data-book-grid style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 24 }}>
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
}
