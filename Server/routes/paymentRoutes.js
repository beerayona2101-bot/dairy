import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  createRazorpayOrder,
  verifyPayment,
  getPaymentDetails,
  handleRazorpayWebhook,
  createRefund,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Razorpay Order (Server SDK)
router.post("/create-razorpay-order", wrapAsync(createRazorpayOrder));

// Verify Razorpay Payment HMAC Signature (Server Cryptographic Verification)
router.post("/verify-payment", wrapAsync(verifyPayment));

// Fetch Payment Details from Razorpay API Server-side
router.get("/details/:paymentId", wrapAsync(getPaymentDetails));

// Razorpay Webhook listener (Backend-to-Backend Event Processing)
router.post("/webhook", wrapAsync(handleRazorpayWebhook));

// Process Refund Server-side
router.post("/refund", wrapAsync(createRefund));

export default router;
