import express from "express"
import wrapAsync from "../../utils/wrapAsync.js"
import { loginUser, signUpUser, verifyOtp, handleInfoInput, getUser, removeUserNotification, getAllCustomers, verifyUser, resetPassword, loginWithGoogle, sendOtpController, deleteUserProfile } from "../../controllers/AuthController/authUser.js";
import { upload } from "../../config/cloudinary.js"

const router = express.Router();

router.post("/signup", wrapAsync(signUpUser));

router.post("/send-otp", wrapAsync(sendOtpController));

router.post("/login", wrapAsync(loginUser));

router.post("/google-login", wrapAsync(loginWithGoogle));

router.post ("/verify-email", wrapAsync(verifyUser))

router.post("/reset-password", wrapAsync(resetPassword))

router.post("/signup/otp-verification", wrapAsync(verifyOtp));

router.post("/signup/info-input", upload.single("photo"), wrapAsync(handleInfoInput));

router.post("/get-user", wrapAsync(getUser));

router.delete("/delete-notification", wrapAsync(removeUserNotification));

router.get("/customers", wrapAsync(getAllCustomers));

router.post("/delete-account", wrapAsync(deleteUserProfile));

export default router;