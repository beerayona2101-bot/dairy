import api from "./api";

// Fetch user/admin notifications
export const getUserNotifications = async (userId) => {
  try {
    const res = await api.get(`/api/notifications/${userId}`);
    return res.data;
  } catch (error) {
    console.error("getUserNotifications API error:", error);
    return { success: false, notifications: [], unreadCount: 0 };
  }
};

// Mark notification(s) as read
export const markNotificationAsRead = async (userId, notificationId = null, mode = "single") => {
  try {
    const res = await api.post("/api/notifications/mark-read", {
      userId,
      notificationId,
      mode,
    });
    return res.data;
  } catch (error) {
    console.error("markNotificationAsRead API error:", error);
    return { success: false };
  }
};

// Delete notification(s)
export const deleteNotification = async (userId, mode = "single", index = null, notificationId = null) => {
  try {
    const res = await api.post("/api/notifications/delete-notification", {
      userId,
      mode,
      index,
      notificationId,
    });
    return res.data;
  } catch (error) {
    console.error("deleteNotification API error:", error);
    return { success: false };
  }
};

// Send custom notification (Admin)
export const sendCustomNotification = async (payload) => {
  try {
    const res = await api.post("/api/notifications/send", payload);
    return res.data;
  } catch (error) {
    console.error("sendCustomNotification API error:", error);
    return { success: false };
  }
};
