
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4f8ef7", "#c084fc"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{payload[0].name}</p>
        <p className="chart-tooltip__value" style={{ color: payload[0].payload.fill }}>
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function WatchlistPieChart({ watchlistCount, watchedCount }) {
  const total = (watchlistCount || 0) + (watchedCount || 0);

  if (total === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card__header">
          <span className="chart-card__icon">🥧</span>
          <h3 className="chart-card__title">Watched vs Watchlist</h3>
        </div>
        <div className="chart-empty">
          <span className="chart-empty__icon">🍿</span>
          <p>Add movies to your watchlist or watched list to see the ratio.</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Watched", value: watchedCount || 0, fill: COLORS[0] },
    { name: "Watchlist", value: watchlistCount || 0, fill: COLORS[1] },
  ].filter((d) => d.value > 0);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <span className="chart-card__icon">🥧</span>
        <h3 className="chart-card__title">Watched vs Watchlist</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
            strokeWidth={0}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: "#9ca3af", fontSize: "13px" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WatchlistPieChart;
