import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
const COLORS = [
  "#4a90a4",
  "#e8a838",
  "#4caf50",
  "#e74c3c",
  "#9b59b6",
  "#3498db",
  "#1abc9c",
  "#f39c12",
  "#e67e22",
  "#2ecc71",
  "#e91e63",
  "#00bcd4",
  "#ff5722",
  "#607d8b",
  "#795548",
];
export default function GenreBreakdown({ data }) {
  if (!data || !data.length)
    return (
      <div className="card">
        <h3>Genre Breakdown</h3>
        <p style={{ color: "var(--color-text-muted)", padding: 24, textAlign: "center" }}>No genre data yet.</p>
      </div>
    );
  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>Genre Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="subject"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
