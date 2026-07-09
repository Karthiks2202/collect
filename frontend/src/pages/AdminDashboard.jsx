import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_reviews: 0,
    total_favorites: 0,
    most_searched_movie: "N/A",
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchStats();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchStats]);

  if (loading) {
    return (
      <AdminLayout>
        <h2>Loading Dashboard...</h2>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Hero Banner */}
      <div className="hero-banner">
        <h1>🎬 Movie Analytics Dashboard</h1>
        <p>
          Monitor users, reviews, favorites and movie trends
          from one place.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.total_users}</h2>
          <p>👥 Total Users</p>
        </div>

        <div className="stat-card">
          <h2>{stats.total_reviews}</h2>
          <p>⭐ Total Reviews</p>
        </div>

        <div className="stat-card">
          <h2>{stats.total_favorites}</h2>
          <p>❤️ Total Favorites</p>
        </div>

        <div className="stat-card">
          <h2 style={{ fontSize: "22px" }}>
            {stats.most_searched_movie}
          </h2>
          <p>🔥 Most Searched Movie</p>
        </div>
      </div>

      {/* Overview Section */}
      <div
        style={{
          marginTop: "30px",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "25px",
          borderRadius: "20px",
          
        }}
      >
        <h2>📈 Platform Overview</h2>

        <p style={{ color: "#94a3b8" }}>
          Your movie recommendation platform is running
          successfully. Track user activity, reviews,
          favorites and movie engagement here.
        </p>
      </div>

      {/* Feature Status */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>User Management</td>
              <td>🟢 Online</td>
            </tr>

            <tr>
              <td>Review Moderation</td>
              <td>🟢 Online</td>
            </tr>

            <tr>
              <td>Favorites Tracking</td>
              <td>🟢 Online</td>
            </tr>

            <tr>
              <td>Movie Analytics</td>
              <td>🟢 Online</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;