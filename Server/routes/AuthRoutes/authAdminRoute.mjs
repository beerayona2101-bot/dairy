import express from "express"
import wrapAsync from "../../utils/wrapAsync.js"
import { getAdmin, handleAdminUpdatePassword, loginAdmin, removeAdminNotification } from "../../controllers/AuthController/authAdmin.js";

const router = express.Router();

router.post("/login", wrapAsync(loginAdmin));

router.post("/get-admin", wrapAsync(getAdmin));

router.delete("/delete-notification", wrapAsync(removeAdminNotification));

router.post("/update-password", wrapAsync(handleAdminUpdatePassword));

export default router;