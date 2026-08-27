import express from "express";
import {
  submitEnquiry,
  getEnquiries,
  sendAdminEnquiryReply,
} from "../controllers/enquiryController.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = express.Router();

router.post("/submit", wrapAsync(submitEnquiry));
router.get("/all", wrapAsync(getEnquiries));
router.post("/reply", wrapAsync(sendAdminEnquiryReply));

export default router;
