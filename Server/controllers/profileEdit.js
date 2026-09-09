import mongoose from "mongoose";
import Address from "../models/AddressShema.js";
import User from "../models/UserSchema.js";
import Admin from "../models/AdminSchema.js";

const findUserOrAdmin = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return null;
  let doc = await User.findById(userId);
  if (!doc) {
    doc = await Admin.findById(userId);
  }
  return doc;
};

export const editProfile = async (req, res) => {
  const { editData, userId } = req.body;

  if (!userId || !editData) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required data" });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: editData },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    newUser: updatedUser,
  });
};

export const getAddresses = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Missing user id" });
  }

  let userAddresses = await Address.find({ owner: userId });

  if (!userAddresses || userAddresses.length === 0) {
    const user = await User.findById(userId).populate("savedAddresses");
    if (user && user.savedAddresses && user.savedAddresses.length > 0) {
      userAddresses = user.savedAddresses.filter(Boolean);
    } else if (user && user.address && (user.address.streetAddress || user.address.pincode)) {
      const primaryName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User";
      const primaryPhone = user.mobileNo || "0000000000";
      const primaryAddr = new Address({
        owner: userId,
        addressType: "Home",
        name: primaryName,
        phone: primaryPhone,
        hno: user.address.hno || "",
        streetAddress: user.address.streetAddress || user.address.village || "Main Road",
        village: user.address.village || "",
        city: user.address.city || user.address.district || "City",
        district: user.address.district || "",
        state: user.address.state || "State",
        pincode: user.address.pincode || "000000",
      });
      await primaryAddr.save().catch(() => { });
      await User.findByIdAndUpdate(userId, { $push: { savedAddresses: primaryAddr._id } }).catch(() => { });
      userAddresses = [primaryAddr];
    }
  }

  return res.status(200).json({
    success: true,
    message: "Addresses fetched successfully",
    userAddresses: userAddresses || [],
  });
};

export const getProfileData = async (req, res) => {
  const { profile_id } = req.body;

  if (!profile_id) {
    return res.status(400).json({
      success: false,
      message: "Profile ID is required",
    });
  }

  const user = await User.findById(profile_id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    userData: user,
  });
};

export const saveNewAddress = async (req, res) => {
  let { userId, address } = req.body;

  if (!userId || !address) {
    return res.status(400).json({
      success: false,
      message: "Fields missing",
    });
  }

  const userDoc = await User.findById(userId).catch(() => null);

  const addressToSave = {
    ...address,
    name: address.name?.trim() || `${userDoc?.firstName || ""} ${userDoc?.lastName || ""}`.trim() || userDoc?.username || "User",
    phone: address.phone?.trim() || userDoc?.mobileNo || "0000000000",
    addressType: address.addressType || "Home",
  };

  const newAddress = new Address({
    owner: userId,
    ...addressToSave,
  });

  await newAddress.save();

  await User.findByIdAndUpdate(userId, {
    $push: {
      savedAddresses: newAddress._id,
    },
  }).catch(() => { });

  res.status(200).json({
    success: true,
    message: "Address saved successfully",
    address: newAddress,
  });
};

export const deleteAddress = async (req, res) => {
  const { addressId, userId } = req.body;

  if (!addressId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Address ID or User ID is missing",
    });
  }

  await Address.findByIdAndDelete(addressId);

  await User.findByIdAndUpdate(userId, {
    $pull: { savedAddresses: addressId },
  });

  return res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
};

export const editAddress = async (req, res) => {
  const { addressId, updatedData } = req.body;

  if (!addressId || !updatedData) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const updatedDoc = await Address.findByIdAndUpdate(addressId, updatedData, { new: true });
  return res
    .status(200)
    .json({ success: true, message: "Address updated successfully", address: updatedDoc });
};

export const editProfilePhoto = async (req, res) => {
  const userId = req.body.id;
  const imageUrl = req?.file?.path || req?.file?.url;

  if (!userId || !imageUrl) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { photo: imageUrl },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Profile photo updated",
    updatedPhoto: updatedUser.photo,
  });
};

export const addToWishlistedProducts = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ success: false, error: "User ID and Product ID are required." });
    }

    let updated = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlistedProducts: productId } },
      { new: true }
    );

    if (!updated) {
      updated = await Admin.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlistedProducts: productId } },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: "User or Admin not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist.",
      wishlistedProducts: updated.wishlistedProducts || [],
    });
  } catch (error) {
    console.error("addToWishlistedProducts error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to add to wishlist." });
  }
};

export const getUserWishlistedProducts = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required." });
    }

    let user = await User.findById(userId).populate("wishlistedProducts");
    if (!user) {
      user = await Admin.findById(userId).populate("wishlistedProducts");
    }

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const rawCount = (user.wishlistedProducts || []).length;
    const cleanWishlist = (user.wishlistedProducts || []).filter((p) => p && p._id);
    if (cleanWishlist.length !== rawCount && user._id) {
      const cleanIds = cleanWishlist.map((p) => p._id);
      await User.findByIdAndUpdate(userId, { wishlistedProducts: cleanIds }).catch(() => { });
      await Admin.findByIdAndUpdate(userId, { wishlistedProducts: cleanIds }).catch(() => { });
    }

    return res
      .status(200)
      .json({ success: true, wishlistedProducts: cleanWishlist });
  } catch (error) {
    console.error("getUserWishlistedProducts error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch wishlist." });
  }
};

export const removeFromWishlistedProducts = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ success: false, error: "User ID and Product ID are required." });
    }

    let updated = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlistedProducts: productId } },
      { new: true }
    );

    if (!updated) {
      updated = await Admin.findByIdAndUpdate(
        userId,
        { $pull: { wishlistedProducts: productId } },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: "User or Admin not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
      wishlistedProducts: updated.wishlistedProducts || [],
    });
  } catch (error) {
    console.error("removeFromWishlistedProducts error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to remove from wishlist." });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { userId, email } = req.body;
    let deletedUser = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      deletedUser = await User.findByIdAndDelete(userId);
    }

    const targetEmail = email || req.body.email;
    if (targetEmail) {
      const cleanEmail = targetEmail.trim().toLowerCase();
      const userByEmail = await User.findOneAndDelete({
        email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') }
      });
      if (!deletedUser) deletedUser = userByEmail;
    }

    if (deletedUser) {
      await Address.deleteMany({ owner: deletedUser._id }).catch(() => { });
      if (deletedUser.email) {
        await User.deleteMany({ email: { $regex: new RegExp(`^${deletedUser.email.trim()}$`, 'i') } }).catch(() => { });
      }
    }

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete user account error:", error);
    return res.status(500).json({ success: false, message: error.message || "Error deleting account." });
  }
};

export const clearUserWishlist = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "User ID is required." });
    }

    let updated = await User.findByIdAndUpdate(
      userId,
      { $set: { wishlistedProducts: [] } },
      { new: true }
    );

    if (!updated) {
      updated = await Admin.findByIdAndUpdate(
        userId,
        { $set: { wishlistedProducts: [] } },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: "User or Admin not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully.",
    });
  } catch (error) {
    console.error("clearUserWishlist error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to clear wishlist." });
  }
};
