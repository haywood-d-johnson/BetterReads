import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getThemeColors() {
  const isDark = document.documentElement.dataset.theme === "dark";
  return {
    grid: isDark ? "#3a5a3a" : "#d4cfb8",
    bar: isDark ? "#8fb596" : "#6b8f71",
    text: isDark ? "#b8c4b0" : "#5a6b5c",
    tooltipBg: isDark ? "#243524" : "#ffffff",
    tooltipText: isDark ? "#e8e4d4" : "#2c3e2d",
  };
}

export default function YearlyChart({ data }) {
  const d = data.map((x) => ({ ...x, name: MONTHS[x.month - 1] }));
  const colors = getThemeColors();
  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>Books Finished Per Month</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={d}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.text }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
          <Tooltip contentStyle={{ background: colors.tooltipBg, color: colors.tooltipText, border: `1px solid ${colors.grid}` }} />
          <Bar dataKey="count" fill={colors.bar} radius={[4, 4, 0, 0]} name="Books" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
