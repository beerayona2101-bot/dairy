import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  sendCustomNotification,
  testPushNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/:userId", getUserNotifications);
router.post("/mark-read", markNotificationAsRead);
router.delete("/delete", deleteNotification);
router.post("/delete-notification", deleteNotification);
router.post("/send", sendCustomNotification);
router.post("/test-push", testPushNotification);

export default router;
