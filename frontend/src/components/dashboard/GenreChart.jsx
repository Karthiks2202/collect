
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#4f8ef7", "#c084fc", "#4ff79e", "#f7c44f", "#f7564f"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        <p className="chart-tooltip__value" style={{ color: COLORS[0] }}>
          {payload[0].value} {payload[0].value === 1 ? "movie" : "movies"}
        </p>
      </div>
    );
  }
  return null;
};

function GenreChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card__header">
          <span className="chart-card__icon">🎭</span>
          <h3 className="chart-card__title">Top Genres</h3>
        </div>
        <div className="chart-empty">
          <span className="chart-empty__icon">🎞️</span>
          <p>No genre data yet. Start watching movies!</p>
        </div>
      </div>
    );
  }

  // Find top genre for badge
  const topGenre = data[0];

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <span className="chart-card__icon">🎭</span>
        <h3 className="chart-card__title">Top Genres</h3>
        {topGenre && (
          <span className="most-watched-badge">
            🏆 Most Watched: {topGenre.genre}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="genre"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GenreChart;
