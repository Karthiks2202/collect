import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUnreadCount } from "../services/notificationService";

function Navbar() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const loadCount = async () => {
    try {
      const data = await getUnreadCount();
      setCount(data.count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(loadCount, 30000);
    const id = setTimeout(loadCount, 0);

    return () => {
      clearInterval(interval);
      clearTimeout(id);
    };
  }, []);

  return (

    <div className="navbar">

      <div className="logo">
        Movie<span>Box</span>
      </div>

      <div className="nav-right">
        <button
          className="notification-btn"
          onClick={() => navigate("/notifications")}
        >
          🔔
          {count > 0 && (
            <span className="notification-badge">{count}</span>
          )}
        </button>

      </div>

    </div>
    
  );
}

export default Navbar;