import api from "./api";

export const loginAdmin = async (email, password) => {
  const res = await api.post("/admin/login", { email, password });
  return res.data;
};

export const getAdminById = async (adminId) => {
  const res = await api.post("/admin/get-admin", { _id: adminId });
  return res?.data;
};

export const removeAdminNotification = async (adminId, mode, index) => {
  const res = await api.delete("/admin/delete-notification", {
    data: {
      adminId,
      mode,
      index,
    },
  });
  return res?.data;
};

export const handleAdminProfileEdit = async (formData) => {
  const res = await api.post("/admin-profile/profile-update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const fetchCustomers = async () => {
  const res = await api.get("/u/customers");
  return res?.data ?? [];
};

export const handleUpdateAdminPassword = async (adminId, newPassword, serverOtp, userOtp) => {
  const res = await api.post("/admin/update-password", { 
    adminId,
    newPassword, 
    serverOtp,
    userOtp,
  });
  return res?.data;
}