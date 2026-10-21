import express from "express"
import wrapAsync from "../../utils/wrapAsync.js"
import { loginUser, signUpUser, verifyOtp, handleInfoInput, getUser, removeUserNotification, getAllCustomers, verifyUser, resetPassword, loginWithGoogle, sendOtpController, deleteUserProfile, verifyUserSession } from "../../controllers/AuthController/authUser.js";
import { upload } from "../../config/cloudinary.js"
import { verifyUserAuth, verifyAdminAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/verify-session", verifyUserAuth, wrapAsync(verifyUserSession));
router.post("/verify-session", verifyUserAuth, wrapAsync(verifyUserSession));

router.post("/signup", wrapAsync(signUpUser));

router.post("/send-otp", wrapAsync(sendOtpController));

router.post("/login", wrapAsync(loginUser));

router.post("/google-login", wrapAsync(loginWithGoogle));

router.post("/verify-email", wrapAsync(verifyUser));

router.post("/reset-password", wrapAsync(resetPassword));

router.post("/verify-otp", wrapAsync(verifyOtp));

router.post("/signup/otp-verification", wrapAsync(verifyOtp));

router.post("/signup/info-input", upload.single("photo"), wrapAsync(handleInfoInput));

router.post("/get-user", wrapAsync(getUser));

router.delete("/delete-notification", verifyUserAuth, wrapAsync(removeUserNotification));

router.get("/customers", verifyAdminAuth, wrapAsync(getAllCustomers));

router.post("/delete-account", verifyUserAuth, wrapAsync(deleteUserProfile));

// FCM Token Management Endpoints
router.post("/update-fcm-token", wrapAsync(async (req, res) => {
  const { userId, fcmToken, role } = req.body;
  if (!userId || !fcmToken) {
    return res.status(400).json({ success: false, message: "Missing userId or fcmToken" });
  }

  const mongoose = (await import("mongoose")).default;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid userId format" });
  }

  const UserModel = (await import("../../models/UserSchema.js")).default;
  const AdminModel = (await import("../../models/AdminSchema.js")).default;

  const TargetModel = role === "admin" ? AdminModel : UserModel;
  let updated = await TargetModel.findByIdAndUpdate(
    userId,
    { $addToSet: { fcmTokens: fcmToken } },
    { new: true }
  );

  if (!updated) {
    const AltModel = role === "admin" ? UserModel : AdminModel;
    updated = await AltModel.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: fcmToken } },
      { new: true }
    );
  }

  return res.status(200).json({
    success: true,
    message: "FCM token registered successfully",
  });
}));

router.post("/remove-fcm-token", wrapAsync(async (req, res) => {
  const { userId, fcmToken } = req.body;
  if (!userId || !fcmToken) {
    return res.status(400).json({ success: false, message: "Missing userId or fcmToken" });
  }

  const mongoose = (await import("mongoose")).default;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid userId format" });
  }

  const UserModel = (await import("../../models/UserSchema.js")).default;
  const AdminModel = (await import("../../models/AdminSchema.js")).default;

  await UserModel.findByIdAndUpdate(userId, { $pull: { fcmTokens: fcmToken } }).catch(() => {});
  await AdminModel.findByIdAndUpdate(userId, { $pull: { fcmTokens: fcmToken } }).catch(() => {});

  return res.status(200).json({ success: true, message: "FCM token removed successfully" });
}));

export default router;
