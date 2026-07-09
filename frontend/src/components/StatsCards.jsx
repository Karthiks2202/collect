import { useEffect, useRef, useState } from "react";

const STAT_META = [
  {
    key: "watched_count",
    label: "Movies Watched",
    icon: "🎬",
    gradient: "linear-gradient(135deg, #1a1f3a 0%, #0d1b2a 100%)",
    accent: "#4f8ef7",
  },
  {
    key: "favorites_count",
    label: "Favourites",
    icon: "❤️",
    gradient: "linear-gradient(135deg, #2a1a1a 0%, #1e0d0d 100%)",
    accent: "#f7564f",
  },
  {
    key: "watchlist_count",
    label: "Watchlist",
    icon: "📋",
    gradient: "linear-gradient(135deg, #1a2a1a 0%, #0d1e0d 100%)",
    accent: "#4ff79e",
  },
  {
    key: "reviews_count",
    label: "Reviews Written",
    icon: "✍️",
    gradient: "linear-gradient(135deg, #2a261a 0%, #1e1a0d 100%)",
    accent: "#f7c44f",
  },
  {
    key: "collections_count",
    label: "Collections",
    icon: "📁",
    gradient: "linear-gradient(135deg, #1e1a2a 0%, #130d1e 100%)",
    accent: "#c084fc",
  },
  {
    key: "total_searches",
    label: "Total Searches",
    icon: "🔍",
    gradient: "linear-gradient(135deg, #1a2a2a 0%, #0d1e1e 100%)",
    accent: "#4fc8f7",
  },
];

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target === 0) {
      const id = setTimeout(() => setCount(0), 0);
      return () => clearTimeout(id);
    }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

function StatCard({ meta, value }) {
  const animated = useCountUp(value ?? 0, 1000);

  return (
    <div className="stat-card" style={{ background: meta.gradient }}>
      <div className="stat-card__icon" style={{ color: meta.accent }}>
        {meta.icon}
      </div>
      <div className="stat-card__value" style={{ color: meta.accent }}>
        {animated}
      </div>
      <div className="stat-card__label">{meta.label}</div>
      <div
        className="stat-card__glow"
        style={{ background: meta.accent }}
      />
    </div>
  );
}

function StatsCards({ stats }) {
  if (!stats) {
    return (
      <div className="stats-grid stats-loading">
        {STAT_META.map((m) => (
          <div key={m.key} className="stat-card stat-card--skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      {STAT_META.map((meta) => (
        <StatCard key={meta.key} meta={meta} value={stats[meta.key] ?? 0} />
      ))}
    </div>
  );
}

export default StatsCards;
