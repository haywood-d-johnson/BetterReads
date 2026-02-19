import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function getThemeColors() {
  const isDark = document.documentElement.dataset.theme === "dark";
  return {
    grid: isDark ? "#3a5a3a" : "#d4cfb8",
    bar: isDark ? "#e8b84e" : "#d4a24e",
    text: isDark ? "#b8c4b0" : "#5a6b5c",
    tooltipBg: isDark ? "#243524" : "#ffffff",
    tooltipText: isDark ? "#e8e4d4" : "#2c3e2d",
  };
}

export default function RatingDistribution({ data }) {
  const d = data.map((x) => ({ ...x, name: x.rating + " \u2605" }));
  const colors = getThemeColors();
  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>Rating Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={d} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: colors.text }} width={50} />
          <Tooltip contentStyle={{ background: colors.tooltipBg, color: colors.tooltipText, border: `1px solid ${colors.grid}` }} />
          <Bar dataKey="count" fill={colors.bar} radius={[0, 4, 4, 0]} name="Books" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
