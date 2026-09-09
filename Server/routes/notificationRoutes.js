import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  sendCustomNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/:userId", getUserNotifications);
router.post("/mark-read", markNotificationAsRead);
router.delete("/delete", deleteNotification);
router.post("/delete-notification", deleteNotification);
router.post("/send", sendCustomNotification);

export default router;
