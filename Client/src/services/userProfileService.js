import api from "./api";

export const updateUserProfilePhoto = async (formData, onUploadProgress) => {
  const res = await api.post("/user-profile/edit-profilePhoto", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return res.data;
};

export const getSavedAddresses = async (userId) => {
  const res = await api.post("/user-profile/get-addresses", { userId });
  return res.data;
};

export const getUserProfile = async (profile_id) => {
  const res = await api.post("/user-profile/profile", { profile_id });
  return res.data;
};

export const updateUserProfile = async (editData, userId) => {
  const res = await api.put("/user-profile/profile-edit", { editData, userId });
  return res.data;
};

export const addNewAddress = async (userId, address) => {
  const res = await api.post("/user-profile/add-address", {
    userId,
    address,
  });
  return res.data;
};

export const deleteAddress = async (addressId, userId) => {
  const res = await api.post("/user-profile/remove-address", {
    addressId,
    userId,
  });
  return res.data;
};

export const updateAddress = async (addressId, updatedData) => {
  const res = await api.put("/user-profile/edit-address", {
    addressId,
    updatedData,
  });
  return res.data;
};

export const addToWishlist = async (userId, productId) => {
  const res = await api.put("/user-profile/add-to-wishlist", {
    userId,
    productId,
  });
  return res.data;
};

export const getWishlistedProducts = async (userId) => {
  const res = await api.post("/user-profile/get-wishlisted", { userId });
  return res?.data;
};

export const removeProductFromWishList = async (userId, productId) => {
  const res = await api.post("/user-profile/remove-from-wishlist", {
    userId,
    productId,
  });
  return res?.data;
};

export const clearUserWishlist = async (userId) => {
  const res = await api.post("/user-profile/clear-wishlist", { userId });
  return res?.data;
};

export const submitSignupForm = async (formData) => {
  const res = await api.post("/u/signup/info-input", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data;
};

export const removeUserNotification = async (userId, mode, index) => {
  const res = await api.delete("/u/delete-notification", {
    data: {
      userId,
      mode,
      index,
    },
  });
  return res?.data;
};

export const deleteUserAccount = async (userId, email) => {
  try {
    const res = await api.post("/user-profile/delete-account", { userId, email });
    return res?.data;
  } catch (error) {
    try {
      const fallbackRes = await api.post("/u/delete-account", { userId, email });
      return fallbackRes?.data;
    } catch (fallbackError) {
      throw error;
    }
  }
};
