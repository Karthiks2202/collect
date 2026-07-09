import { useEffect, useState, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

import StatsCards from "../components/StatsCards";
import GenreChart from "../components/dashboard/GenreChart";
import MonthlyChart from "../components/dashboard/MonthlyChart";
import WatchlistPieChart from "../components/dashboard/WatchlistPieChart";
import RecentActivity from "../components/dashboard/RecentActivity";

import "./Dashboard.css";

// ─── Loading Spinner ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="dashboard-spinner-wrap">
      <div className="dashboard-spinner" />
      <p className="dashboard-spinner-text">Loading your dashboard…</p>
    </div>
  );
}

// ─── Streak Counter + Motivational Banner ──────────────────────────────────
function StreakBanner({ watchedCount, streak }) {
  if (!watchedCount || watchedCount === 0) return null;

  let message = "";
  if (watchedCount >= 50) message = "🔥 You're on fire! 50+ movies watched!";
  else if (watchedCount >= 20) message = `🎉 Amazing! You've watched ${watchedCount} movies!`;
  else if (watchedCount >= 10) message = `🍿 ${watchedCount} movies down — keep the streak going!`;
  else if (watchedCount >= 1)  message = `👋 ${watchedCount} ${watchedCount === 1 ? "movie" : "movies"} watched — great start!`;

  return (
    <div className="dashboard-streak-banner">
      <span>{message}</span>
      {streak > 0 && (
        <span className="streak-chip" title="Consecutive days you watched a movie">
          🔥 {streak} day{streak === 1 ? "" : "s"} streak
        </span>
      )}
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────
function Dashboard() {
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [genres, setGenres] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, genresRes, monthlyRes, recentRes] = await Promise.all([
        API.get("/dashboard/"),
        API.get("/dashboard/genres"),
        API.get("/dashboard/monthly"),
        API.get("/dashboard/recent"),
      ]);

      setStats(statsRes.data);
      setGenres(genresRes.data);
      setMonthly(monthlyRes.data);
      setRecent(recentRes.data);
    } catch (err) {
      const message =
        err?.response?.data?.detail || "Failed to load dashboard data.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const id = setTimeout(fetchAll, 0);
    return () => clearTimeout(id);
  }, [fetchAll]);

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-page">
      {/* ─── Header ─── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-heading">
            📊 My Dashboard
          </h1>
          <p className="dashboard-subheading">
            Your complete movie activity overview
          </p>
        </div>
        <button
          id="dashboard-refresh-btn"
          className="dashboard-refresh-btn"
          onClick={fetchAll}
          title="Refresh dashboard"
        >
          🔄 Refresh
        </button>
      </div>

      {/* ─── Motivational Banner ─── */}
      <StreakBanner watchedCount={stats?.watched_count} streak={stats?.streak} />

      {/* ─── Stats Cards ─── */}
      <section className="dashboard-section" aria-label="Stats overview">
        <StatsCards stats={stats} />
      </section>

      {/* ─── Charts Row 1: Genre + Monthly ─── */}
      <section className="dashboard-section dashboard-charts-row" aria-label="Activity charts">
        <GenreChart data={genres} />
        <MonthlyChart data={monthly} />
      </section>

      {/* ─── Charts Row 2: Pie Chart ─── */}
      <section className="dashboard-section dashboard-charts-row dashboard-charts-row--single" aria-label="Watched vs Watchlist">
        <WatchlistPieChart
          watchedCount={stats?.watched_count}
          watchlistCount={stats?.watchlist_count}
        />
      </section>

      {/* ─── Recent Activity ─── */}
      <section className="dashboard-section" aria-label="Recent activity">
        <RecentActivity data={recent} />
      </section>
    </div>
  );
}

export default Dashboard;
