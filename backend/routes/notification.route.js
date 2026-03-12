import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  deleteNotification 
} from "../controller/notification.controller.js";
import { authenticate } from "../middleware/auth.js"; // Your auth protector
import Notification from "../models/Notification.js";
const router = express.Router();

router.get("/unread-count", authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      organizationId: req.user.organizationId,
      userId: req.user.userId,
      isRead: false
    });

    res.json({ unread: count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
});

router.get("/", authenticate, getNotifications);
router.patch("/:id/read", authenticate, markAsRead);
router.delete("/:id", authenticate, deleteNotification);

export default router;