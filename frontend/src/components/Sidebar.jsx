import { Link } from "react-router-dom";
import { useEffect } from "react";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <Link to="/" onClick={onClose}>
        🏠 Home
      </Link>
      <Link to="/dashboard" onClick={onClose}>
        📊 Dashboard
      </Link>
      <Link to="/favorites" onClick={onClose}>
        ❤️ Favorites
      </Link>
      <Link to="/history" onClick={onClose}>
        🕒 History
      </Link>
      <Link to="/watchlist" onClick={onClose}>
        📺 Watchlist
      </Link>
      <Link to="/watched" onClick={onClose}>
        👁️ Watched
      </Link>
      <Link to="/collections" onClick={onClose}>
        📁 My Collections
      </Link>
      <Link to="/collections/public" onClick={onClose}>
        🌐 Public Collections
      </Link>
      <Link to="/profile" onClick={onClose}>
        👤 Profile
      </Link>
    </div>
  );
}

export default Sidebar;
