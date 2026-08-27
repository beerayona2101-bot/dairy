import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { createRazorpayOrder } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-razorpay-order", wrapAsync(createRazorpayOrder));

export default router;