import { useEffect, useState, useCallback } from "react";

import NotificationCard from "../components/NotificationCard";

import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // Silently ignore — no UI action needed for notification load failures
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadNotifications();
    }, 0);
    return () => clearTimeout(t);
  }, [loadNotifications]);

  const handleRead = useCallback(async (id) => {
    await markAsRead(id);
    loadNotifications();
  }, [loadNotifications]);

  const handleDelete = useCallback(async (id) => {
    await deleteNotification(id);
    loadNotifications();
  }, [loadNotifications]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRead={handleRead}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}

export default Notifications;