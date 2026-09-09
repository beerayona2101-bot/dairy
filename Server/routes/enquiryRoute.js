import express from "express";
import {
  submitEnquiry,
  getEnquiries,
  sendAdminEnquiryReply,
} from "../controllers/enquiryController.js";
import wrapAsync from "../utils/wrapAsync.js";
import { verifyAdminAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/submit", wrapAsync(submitEnquiry));
router.get("/all", verifyAdminAuth, wrapAsync(getEnquiries));
router.post("/reply", verifyAdminAuth, wrapAsync(sendAdminEnquiryReply));

export default router;
