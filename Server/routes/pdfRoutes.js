import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { generateOrderBillPDF } from "../controllers/pdfController.js";

const router = express.Router();

router.get("/generate-bill/:orderId", wrapAsync(generateOrderBillPDF));

export default router;