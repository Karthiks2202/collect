import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const activeStyle = {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#ffffff",
    boxShadow: "0 8px 20px rgba(99,102,241,0.35)",
  };

  return (
    <div className="admin-sidebar">
      <div className="logo-section">
        <h1 className="logo">🎬 MovieHub</h1>
        <p className="subtitle">Admin Dashboard</p>
      </div>

      <nav className="admin-nav">
        <Link
          to="/admin"
          style={location.pathname === "/admin" ? activeStyle : undefined}
        >
          📊 Dashboard
        </Link>

        <Link
          to="/admin/users"
          style={location.pathname === "/admin/users" ? activeStyle : undefined}
        >
          👥 Users
        </Link>

        <Link
          to="/admin/reviews"
          style={location.pathname === "/admin/reviews" ? activeStyle : undefined}
        >
          ⭐ Reviews
        </Link>
      </nav>

      <div className="logout-section">
        <button onClick={logout}>🚪 Logout</button>
      </div>
    </div>
  );
}

export default AdminSidebar;
