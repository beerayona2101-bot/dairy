import React, { useContext, useEffect, useState, forwardRef } from "react";
import { Avatar, Dialog } from "@mui/material";
import { Save, X, Pencil } from "lucide-react";
import { AdminAuthContext } from "../../../context/AuthProvider";
import { useSnackbar } from "notistack";
import { handleAdminProfileEdit, handleUpdateAdminPassword } from "../../../services/adminService";
import { LockReset } from "@mui/icons-material";
import Slide from '@mui/material/Slide';
import { generateOtp } from "../../../services/userService";
import { sendOtpEmail } from "../../../services/sentOtp";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AdminProfileInfo() {
  const { authAdmin, setAuthAdmin } = useContext(AdminAuthContext);
  const { enqueueSnackbar } = useSnackbar();

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState(new Array(5).fill(""));
  const [serverOtp, setServerOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSendLoading, setOtpSendLoading] = useState(false);
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false);

  useEffect(() => {
    if (authAdmin) {
      setFormData({ ...authAdmin });
      setPreviewImage(authAdmin.image || "");
    }
  }, [authAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("factoryAddress.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        factoryAddress: {
          ...prev.factoryAddress,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAdminInfo = async () => {
    try {
      setLoading(true);
      const form = new FormData();

      form.append("adminId", authAdmin._id);
      form.append("name", formData.name || "");
      form.append("username", formData.username || "");
      form.append("email", formData.email || "");
      form.append("mobileNo", formData.mobileNo || "");

      if (formData.factoryAddress) {
        form.append("factoryAddress.street", formData.factoryAddress.street || "");
        form.append("factoryAddress.city", formData.factoryAddress.city || "");
        form.append("factoryAddress.state", formData.factoryAddress.state || "");
        form.append("factoryAddress.pincode", formData.factoryAddress.pincode || "");
      }

      if (imageFile) {
        form.append("image", imageFile);
      }

      const res = await handleAdminProfileEdit(form);

      if (!res?.admin) {
        throw new Error("Profile update failed: no admin returned.");
      }

      setAuthAdmin(res.admin);
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
      setEditMode(false);
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message || "Failed to update profile",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index] === "") {
        if (index > 0) {
          document.getElementById(`otp-${index - 1}`).focus();
        }
      } else {
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const startResendTimer = () => {
    setTimeLeft(60);
    setCanResend(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateAndSendOtp = async () => {
    const newOtp = generateOtp();
    setServerOtp(newOtp);
    setOtp(new Array(5).fill(""));

    setOtpSendLoading(true);

    try {
      const res = await sendOtpEmail(authAdmin?.email, newOtp);
      if (res?.success) {
        setOpen(true);
        startResendTimer();
        enqueueSnackbar("OTP sent successfully to your registered email.", { variant: "success" });
      } else {
        setOpen(false);
        enqueueSnackbar("Failed to send OTP. Please try again.", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Something went wrong while sending OTP.",
        { variant: "error" }
      );
    } finally {
      setOtpSendLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 5) {
      enqueueSnackbar("Please enter all 5 digits of the OTP", {
        variant: "warning",
      });
      return;
    }

    if (enteredOtp === serverOtp) {
      enqueueSnackbar("OTP verified successfully!", {
        variant: "success",
      });
      setShowPasswordFields(true);
    } else {
      enqueueSnackbar("Incorrect OTP. Please try again.", {
        variant: "error",
      });
    }
  };

  const handleSubmitNewPassword = async () => {

    if (!authAdmin?._id) {
      enqueueSnackbar("Unauthorized access", { variant: "error" });
      return;
    }

    const userOtp = otp.join("");

    if (!password || !confirmPassword || !userOtp || !serverOtp) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }

    if (password !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return;
    }

    setUpdatePasswordLoading(true);

    try {
      const res = await handleUpdateAdminPassword(
        authAdmin._id,
        password,
        serverOtp,
        userOtp
      );

      if (res?.success) {
        enqueueSnackbar(res.message || "Password updated successfully", {
          variant: "success",
        });
        setOtp(new Array(5).fill(""));
        setPassword("");
        setConfirmPassword("");
        setServerOtp("");
        setShowPasswordFields(false);
        setOpen(false);
      } else {
        enqueueSnackbar(res?.message || "Failed to update password", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong. Please try again.", {
        variant: "error",
      });
    } finally {
      setUpdatePasswordLoading(false);
    }
  }

  const fallback = (value) => value || <span className="italic text-gray-400">Not provided</span>;

  let resendSection;
  if (canResend) {
    if (otpSendLoading) {
      resendSection = (
        <div className="flex items-center justify-center text-sm text-blue-600">
          <div className="h-4 w-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Sending...
        </div>
      );
    } else {
      resendSection = (
        <button
          onClick={generateAndSendOtp}
          disabled={otpSendLoading}
          className="text-blue-600 hover:underline text-sm"
        >
          Resend OTP
        </button>
      );
    }
  } else {
    resendSection = (
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Resend available in {timeLeft} sec
      </p>
    );
  }

  return (
    <>
      <div className="bg-gray-100 dark:bg-gray-500/20 p-3 md:p-6 rounded flex flex-col md:flex-row gap-6 transition-all duration-300 items-start md:items-center">
        <div className="flex md:block flex-col gap-3">
          <Avatar
            src={previewImage}
            alt={formData.name || "Admin"}
            className="!w-24 !h-24 sm:!w-36 sm:!h-36 md:!w-50 md:!h-50"
          />
          {editMode && (
            <label className="text-sm text-blue-600 dark:text-blue-300 cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              Change Photo
            </label>
          )}
        </div>

        <div className="flex-1 w-full space-y-2 text-gray-800 dark:text-white">
          {[{ label: "Name", name: "name", placeholder: "Enter your name" },
          { label: "Username", name: "username", placeholder: "Enter username" },
          { label: "Email", name: "email", placeholder: "Enter email address" },
          { label: "Mobile No", name: "mobileNo", placeholder: "Enter 10-digit mobile number" }]
            .map((field) => (
              <div key={field.name} className="flex items-center justify-between gap-4">
                <span className="font-medium w-20 sm:w-30 md:w-40">{field.label}:</span>
                {editMode ? (
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="flex-1 w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                ) : (
                  <span className="flex-1 text-sm">{fallback(formData[field.name])}</span>
                )}
              </div>
            ))}

          <div className="space-y-2">
            <div className="font-semibold text-lg text-gray-900 dark:text-white">Factory Address</div>
            {editMode ? (
              ["street", "city", "state", "pincode"].map((key) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="font-medium w-20 sm:w-30 md:w-40 capitalize">{key}:</span>
                  <input
                    type="text"
                    name={`factoryAddress.${key}`}
                    value={formData.factoryAddress?.[key] || ""}
                    onChange={handleChange}
                    placeholder={`Enter ${key}`}
                    className="flex-1 w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))
            ) : (
              <div className="flex items-start gap-4">
                <span className="font-medium w-20 sm:w-30 md:w-40">Address:</span>
                <span className="flex-1 text-sm">
                  {[
                    formData.factoryAddress?.street,
                    formData.factoryAddress?.city,
                    formData.factoryAddress?.state,
                    formData.factoryAddress?.pincode,
                  ].filter(Boolean).length > 0
                    ? [formData.factoryAddress?.street, formData.factoryAddress?.city, formData.factoryAddress?.state, formData.factoryAddress?.pincode].filter(Boolean).join(", ")
                    : <span className="italic text-gray-400">Not provided</span>}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-100 dark:bg-blue-800/30 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-800 dark:text-white rounded"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  onClick={generateAndSendOtp}
                  disabled={otpSendLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-white dark:hover:bg-blue-700 rounded text-sm font-medium transition duration-200 disabled:opacity-60"
                >
                  {otpSendLoading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <LockReset fontSize="small" />
                  )}
                  {otpSendLoading ? "Sending OTP..." : "Update Password"}
                </button>

              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleAdminInfo}
                  disabled={loading}
                  className={`flex items-center gap-1 px-4 py-2 text-sm rounded text-white transition ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={() => {
          if (!updatePasswordLoading) {
            setOpen(false);
          }
        }}
        maxWidth="sm"
        fullWidth
        slots={{ transition: Transition }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "transparent",
              boxShadow: 24,
              borderRadius: 1,
            },
          },
        }}
      >
        <div className="relative bg-white dark:bg-gray-500/20 p-6 rounded shadow-md w-full backdrop-blur-md">

          <button
            onClick={() => {
              if (!updatePasswordLoading) {
                setOpen(false);
              }
            }}
            className="absolute top-3 right-3 text-black dark:text-white hover:opacity-80"
          >
            <X />
          </button>

          {!showPasswordFields && (
            <>
              <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-1">
                Enter OTP
              </h2>

              <p className="text-sm text-center text-blue-700 dark:text-blue-300 mb-1">
                OTP has been sent to: <strong>{authAdmin?.email}</strong>
              </p>

              <p className="text-sm text-red-600 text-center mb-3">
                Don't refresh this page.
              </p>

              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index * 0.589}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={otpSendLoading}
                    className="w-10 h-10 text-center text-lg border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ))}
              </div>

              <div className="w-full flex justify-center">
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpSendLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mb-3 disabled:opacity-60 w-80"
                >
                  Verify OTP
                </button>
              </div>

              <div className="text-sm text-center text-gray-700 dark:text-gray-300">
                {resendSection}
              </div>
            </>
          )}

          {showPasswordFields && (
            <>
              <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-1">
                Update Your Password
              </h2>

              <p className="text-sm text-center text-blue-700 dark:text-blue-300 mb-3">
                OTP verified. You can now set a new password for your account.
              </p>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded mt-4 dark:bg-gray-700 dark:text-white"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded mt-2 dark:bg-gray-700 dark:text-white"
              />

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="mr-2"
                />
                <label
                  htmlFor="showPassword"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Show Password
                </label>
              </div>

              <button
                onClick={handleSubmitNewPassword}
                disabled={updatePasswordLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-4 disabled:cursor-not-allowed"
              >
                Update Password
              </button>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
