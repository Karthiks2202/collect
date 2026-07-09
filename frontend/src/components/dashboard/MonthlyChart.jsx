
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        <p className="chart-tooltip__value" style={{ color: "#4f8ef7" }}>
          {payload[0].value} {payload[0].value === 1 ? "movie" : "movies"}
        </p>
      </div>
    );
  }
  return null;
};

function MonthlyChart({ data }) {
  const totalWatched = data ? data.reduce((sum, d) => sum + d.count, 0) : 0;

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card__header">
          <span className="chart-card__icon">📅</span>
          <h3 className="chart-card__title">Monthly Activity</h3>
        </div>
        <div className="chart-empty">
          <span className="chart-empty__icon">📊</span>
          <p>No activity in the last 6 months.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <span className="chart-card__icon">📅</span>
        <h3 className="chart-card__title">Monthly Activity</h3>
        {totalWatched > 0 && (
          <span className="motivational-badge">
            🎬 {totalWatched} movies in 6 months
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(79,142,247,0.3)", strokeWidth: 2 }} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#4f8ef7"
            strokeWidth={2.5}
            fill="url(#monthlyGradient)"
            dot={{ fill: "#4f8ef7", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#4f8ef7", strokeWidth: 2, stroke: "#1a2a4a" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyChart;
