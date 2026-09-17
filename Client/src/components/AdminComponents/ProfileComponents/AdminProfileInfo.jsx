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
        <div className="flex items-center justify-center text-sm text-[#6C5CE7]">
          <div className="h-4 w-4 mr-2 border-2 border-[#6C5CE7] border-t-transparent rounded-full animate-spin"></div>
          Sending...
        </div>
      );
    } else {
      resendSection = (
        <button
          onClick={generateAndSendOtp}
          disabled={otpSendLoading}
          className="text-[#6C5CE7] hover:underline text-sm font-bold"
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
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-5 md:p-8 rounded-3xl shadow-xs space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <Avatar
                src={previewImage}
                alt={formData.name || "Admin"}
                className="!w-20 !h-20 sm:!w-24 sm:!h-24 border-2 border-[#6C5CE7] shadow-sm"
              />
              {editMode && (
                <label className="absolute bottom-0 right-0 p-1.5 bg-[#6C5CE7] text-white rounded-full cursor-pointer shadow-md hover:scale-110 transition">
                  <Pencil size={14} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {formData.name || "MADHU Admin"}
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                @{formData.username || "admin_MADHU"} • {formData.email || "admin@MADHUdairy.com"}
              </p>
              <span className="inline-block mt-2 px-3 py-0.5 text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 rounded-full">
                System Administrator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold bg-[#6C5CE7] text-white rounded-xl hover:bg-[#5b4cc4] transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Pencil size={14} /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={generateAndSendOtp}
                  disabled={otpSendLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer border border-slate-200 dark:border-slate-600 active:scale-95 disabled:opacity-60"
                >
                  {otpSendLoading ? (
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-600 border-t-transparent rounded-full" />
                  ) : (
                    <LockReset fontSize="small" />
                  )}
                  {otpSendLoading ? "Sending OTP..." : "Change Password"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminInfo}
                  disabled={loading}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-extrabold bg-[#6C5CE7] text-white rounded-xl hover:bg-[#5b4cc4] transition cursor-pointer disabled:opacity-60"
                >
                  <Save size={14} /> {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 space-y-3">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Account Credentials
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Name:</span>
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-white">{formData.name || "MADHU Admin"}</span>
                )}
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Username:</span>
                {editMode ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username || ""}
                    onChange={handleChange}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-white">{formData.username || "admin_MADHU"}</span>
                )}
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Email Address:</span>
                {editMode ? (
                  <input
                    type="text"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-white">{formData.email || "admin@MADHUdairy.com"}</span>
                )}
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-500">Mobile Phone:</span>
                {editMode ? (
                  <input
                    type="text"
                    name="mobileNo"
                    value={formData.mobileNo || ""}
                    onChange={handleChange}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-white">{formData.mobileNo || "9876543210"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Factory Address Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 space-y-3">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Factory & Operations Address
            </h3>
            <div className="space-y-2 text-xs">
              {["street", "city", "state", "pincode"].map((key) => (
                <div key={key} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="font-semibold text-slate-500 capitalize">{key}:</span>
                  {editMode ? (
                    <input
                      type="text"
                      name={`factoryAddress.${key}`}
                      value={formData.factoryAddress?.[key] || ""}
                      onChange={handleChange}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs"
                    />
                  ) : (
                    <span className="font-bold text-slate-800 dark:text-white">
                      {formData.factoryAddress?.[key] || (key === "street" ? "Dairy Road" : key === "city" ? "Mumbai" : key === "state" ? "Maharashtra" : "400001")}
                    </span>
                  )}
                </div>
              ))}
            </div>
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

              <p className="text-sm text-center text-purple-700 dark:text-purple-300 mb-1">
                OTP has been sent to: <strong>{authAdmin?.email}</strong>
              </p>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-bold text-center mb-3">
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
                    className="w-10 h-10 text-center text-lg border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] dark:bg-gray-700 dark:text-white"
                  />
                ))}
              </div>

              <div className="w-full flex justify-center">
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpSendLoading}
                  className="bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white py-2 rounded mb-3 disabled:opacity-60 w-80 font-bold"
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

              <p className="text-sm text-center text-purple-700 dark:text-purple-300 mb-3">
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
                className="w-full bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white py-2 rounded mt-4 disabled:cursor-not-allowed font-bold"
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
