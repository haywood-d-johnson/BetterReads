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

// Custom tooltip so we can show pages read alongside the book count.
function ChartTooltip({ active, payload, label, colors, labelPrefix = "" }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div
      style={{
        background: colors.tooltipBg,
        color: colors.tooltipText,
        border: `1px solid ${colors.grid}`,
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {labelPrefix}
        {label}
      </div>
      <div>
        {row.count} {row.count === 1 ? "book" : "books"}
      </div>
      <div>{(row.pages || 0).toLocaleString()} pages</div>
    </div>
  );
}

// weekStart is a plain "YYYY-MM-DD" string — parse the parts directly to avoid
// timezone shifts from Date parsing.
function weekLabel(weekStart) {
  const [, m, d] = weekStart.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

export default function WeeklyChart({ data }) {
  const d = data.map((x) => ({ ...x, name: weekLabel(x.weekStart) }));
  const colors = getThemeColors();
  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>Books Finished Per Week (Last 12 Weeks)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={d} margin={{ bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: colors.text }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
          <Tooltip content={<ChartTooltip colors={colors} labelPrefix="Week of " />} />
          <Bar dataKey="count" fill={colors.bar} radius={[4, 4, 0, 0]} name="Books" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
