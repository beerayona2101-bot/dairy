import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { getPageContent, updatePageContent } from "../controllers/pageContentController.js";
import { verifyAdminAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/get-content", wrapAsync(getPageContent));
router.put("/update-content", verifyAdminAuth, wrapAsync(updatePageContent));

export default router;
