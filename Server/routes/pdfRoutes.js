import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { generateOrderBillPDF, printOrderBillHTML } from "../controllers/pdfController.js";

const router = express.Router();

router.get("/generate-bill/:orderId", wrapAsync(generateOrderBillPDF));
router.get("/print-bill/:orderId", wrapAsync(printOrderBillHTML));

export default router;
