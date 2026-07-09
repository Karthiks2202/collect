
import "./NotificationCard.css";

function NotificationCard({
  notification,
  onRead,
  onDelete,
}) {
  return (
    <div
      className={`notification-card ${
        notification.is_read ? "read" : ""
      }`}
    >
      <div className="notification-content">
        <h4>{notification.message}</h4>

        <div className="notification-type">
          {notification.notification_type}
        </div>

        <div className="notification-date">
          {new Date(
            notification.created_at
          ).toLocaleString()}
        </div>
      </div>

      <div className="notification-actions">
        {!notification.is_read && (
          <button
            className="read-btn"
            onClick={() => onRead(notification.id)}
          >
            ✓ Read
          </button>
        )}

        <button
          className="delete-btn"
          onClick={() => onDelete(notification.id)}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

export default NotificationCard;