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

const router = express.Router();

router.put("/profile-edit", wrapAsync(editProfile));

router.post("/get-addresses", wrapAsync(getAddresses));

router.post("/profile", wrapAsync(getProfileData));

router.post("/add-address", wrapAsync(saveNewAddress));

router.post("/remove-address", wrapAsync(deleteAddress));

router.put("/edit-address", wrapAsync(editAddress));

router.post("/edit-profilePhoto", upload.single("photo"), wrapAsync(editProfilePhoto));

router.put("/add-to-wishlist", wrapAsync(addToWishlistedProducts));

router.post("/get-wishlisted", wrapAsync(getUserWishlistedProducts));

router.post("/remove-from-wishlist", wrapAsync(removeFromWishlistedProducts));

router.post("/clear-wishlist", wrapAsync(clearUserWishlist));

router.post("/delete-account", wrapAsync(deleteUserProfile));

export default router;
