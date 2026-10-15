import Admin from "../models/AdminSchema.js";

export const updateAdminProfile = async (req, res) => {
  const { adminId, name, username, email, mobileNo } = req.body;

  if (!adminId) {
    return res.status(400).json({
      success: false,
      message: "Admin ID is required.",
    });
  }

  const updatedFields = {};

  if (name) updatedFields.name = name;
  if (username) updatedFields.username = username;
  if (email) updatedFields.email = email;
  if (mobileNo) updatedFields.mobileNo = mobileNo;

  if (req.body["factoryAddress.street"] || req.body["factoryAddress.city"]) {
    updatedFields.factoryAddress = {
      street: req.body["factoryAddress.street"] || "",
      city: req.body["factoryAddress.city"] || "",
      state: req.body["factoryAddress.state"] || "",
      pincode: req.body["factoryAddress.pincode"] || "",
    };
  }

  if (req.file) {
    updatedFields.image = req.file?.url || req.file?.path;
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updatedFields, {
    new: true,
    runValidators: true,
  });

  if (!updatedAdmin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found.",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    admin: updatedAdmin,
  });
};
