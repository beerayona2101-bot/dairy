import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  editProfile,
  getProfileData,
  getAddresses,
  saveNewAddress,
  deleteAddress,
  editAddress,
  editProfilePhoto,
  getUserWishlistedProducts,
  removeFromWishlistedProducts,
  addToWishlistedProducts,
  clearUserWishlist,
  deleteUserProfile,
} from "../controllers/profileEdit.js";
import { upload } from "../config/cloudinary.js";
import { verifyUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/profile-edit", verifyUserAuth, wrapAsync(editProfile));

router.post("/get-addresses", verifyUserAuth, wrapAsync(getAddresses));

router.post("/profile", verifyUserAuth, wrapAsync(getProfileData));

router.post("/add-address", verifyUserAuth, wrapAsync(saveNewAddress));

router.post("/remove-address", verifyUserAuth, wrapAsync(deleteAddress));

router.put("/edit-address", verifyUserAuth, wrapAsync(editAddress));

router.post("/edit-profilePhoto", verifyUserAuth, upload.single("photo"), wrapAsync(editProfilePhoto));

router.put("/add-to-wishlist", verifyUserAuth, wrapAsync(addToWishlistedProducts));

router.post("/get-wishlisted", verifyUserAuth, wrapAsync(getUserWishlistedProducts));

router.post("/remove-from-wishlist", verifyUserAuth, wrapAsync(removeFromWishlistedProducts));

router.post("/clear-wishlist", verifyUserAuth, wrapAsync(clearUserWishlist));

router.post("/delete-account", verifyUserAuth, wrapAsync(deleteUserProfile));

export default router;
