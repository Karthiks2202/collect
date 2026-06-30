import API from "./api";

// ✅ All calls use shared API instance (no hardcoded URL, token auto-attached)

export const getNotifications = async () => {
  const res = await API.get("/notifications");
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await API.patch(`/notifications/${id}/read`, {});
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await API.delete(`/notifications/${id}`);
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await API.get("/notifications/unread-count");
  return res.data;
};