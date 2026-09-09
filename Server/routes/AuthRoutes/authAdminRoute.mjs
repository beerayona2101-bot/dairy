import express from "express"
import wrapAsync from "../../utils/wrapAsync.js"
import { getAdmin, handleAdminUpdatePassword, loginAdmin, removeAdminNotification, verifyAdminSession } from "../../controllers/AuthController/authAdmin.js";
import { verifyAdminAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", wrapAsync(loginAdmin));

router.get("/verify-session", verifyAdminAuth, wrapAsync(verifyAdminSession));
router.post("/verify-session", verifyAdminAuth, wrapAsync(verifyAdminSession));

router.post("/get-admin", wrapAsync(getAdmin));

router.delete("/delete-notification", verifyAdminAuth, wrapAsync(removeAdminNotification));

router.post("/update-password", verifyAdminAuth, wrapAsync(handleAdminUpdatePassword));

export default router;