// utils/notificationHelper.js
import Notification from "../models/Notification.js";
import { getIO } from "./socket.js";

export const sendNotification = async (userId, orgId, title, message, type, link = "") => {
  
  try {
    // 1. Save the primary notification
    const notification = await Notification.create({
      userId,
      organizationId: orgId,
      title,
      message,
      type,
      link
    });

    const io = getIO();

    // 2. Push to the specific user room
    io.to(userId.toString()).emit("notification", notification);

    // 3. 🔥 PUSH TO SUPER ADMINS
    // We emit to a special room called "admin_orgId"
    io.to(`admin_${orgId}`).emit("notification", notification);
    
    return notification;
  } catch (error) {
    console.error("Notification trigger failed:", error);
  }
};