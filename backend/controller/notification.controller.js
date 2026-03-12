import Notification from "../models/Notification.js";

/**
 * 1. GET ALL NOTIFICATIONS FOR LOGGED-IN USER
 * Sorted by newest first
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId; // Or req.user._id based on your auth middleware
    console.log(userId);
    
    // Filter by userId so users only see their own alerts
    // Super Admins might want to see all, but usually, alerts are personal
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    console.log(notifications);
    
    res.status(200).json(notifications);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * 2. MARK SINGLE NOTIFICATION AS READ
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, organizationId }, // Ensure user owns the notification
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

/**
 * 3. DELETE NOTIFICATION
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const result = await Notification.findOneAndDelete({ _id: id, organizationId });

    if (!result) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};