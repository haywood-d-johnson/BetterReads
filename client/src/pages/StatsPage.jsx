import { useState, useEffect } from "react";
import { getOverview, getByYear, getGenres, getRatings } from "../api/stats.js";
import StatCard from "../components/stats/StatCard.jsx";
import YearlyChart from "../components/stats/YearlyChart.jsx";
import GenreBreakdown from "../components/stats/GenreBreakdown.jsx";
import RatingDistribution from "../components/stats/RatingDistribution.jsx";
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import ReaderToggle from "../components/shared/ReaderToggle.jsx";

export default function StatsPage() {
  const [overview, setOverview] = useState(null);
  const [yearly, setYearly] = useState([]);
  const [genres, setGenres] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reader, setReader] = useState("");
  const [loading, setLoading] = useState(true);

  function fetchAll(r, y) {
    return Promise.all([getOverview(r || undefined), getByYear(y, r || undefined), getGenres(r || undefined), getRatings(r || undefined)]);
  }

  useEffect(() => {
    fetchAll(reader, year)
      .then(([o, y, g, r]) => {
        setOverview(o);
        setYearly(y);
        setGenres(g);
        setRatings(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAll(reader, year)
      .then(([o, y, g, r]) => {
        setOverview(o);
        setYearly(y);
        setGenres(g);
        setRatings(r);
      })
      .catch(console.error);
  }, [year, reader]);

  if (loading) return <LoadingSpinner size="lg" text="Loading statistics..." />;

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= currentYear - 5; y--) years.push(y);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1>Reading Statistics</h1>
        <ReaderToggle value={reader} onChange={setReader} showAll />
      </div>

      {overview && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard label="Books Read" value={overview.totalFinished} icon={"\u{1F4D6}"} />
          <StatCard label="Pages Read" value={(overview.totalPages || 0).toLocaleString()} icon={"\u{1F4C4}"} />
          <StatCard label="Avg Rating" value={overview.avgRating || "\u2014"} icon={"\u2B50"} />
          <StatCard label="This Year" value={overview.finishedThisYear} icon={"\u{1F4C5}"} />
          <StatCard label="Currently Reading" value={overview.currentlyReading} icon={"\u{1F4D6}"} />
        </div>
      )}

      <div data-stats-charts style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <select
              className="form-input"
              style={{ width: "auto", padding: "2px 8px" }}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <YearlyChart data={yearly} />
        </div>

        <RatingDistribution data={ratings} />
      </div>

      <GenreBreakdown data={genres} />
    </div>
  );
}
