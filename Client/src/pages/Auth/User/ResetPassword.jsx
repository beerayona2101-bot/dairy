import { Button } from "@mui/material";
import { useSnackbar } from "notistack";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { resetUserPassword } from "../../../services/userService";
import { Home } from "lucide-react";
import BackButton from "../../../components/Common/BackButton";

export default function ResetPassword() {
  const location = useLocation();
  const email = location?.state?.email;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const isValidPassword = (password) => {
    return /^(?=.*\d).{8,}$/.test(password);
  };

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      return enqueueSnackbar("Please fill in all fields", { variant: "warning" });
    }
    if (!isValidPassword(password)) {
      enqueueSnackbar("Password must be at least 8 characters and contain a number.", { variant: "error" });
      return;
    }
    if (password !== confirmPassword) {
      return enqueueSnackbar("Passwords do not match", { variant: "error" });
    }

    setLoading(true);
    try {
      const res = await resetUserPassword(email, password, confirmPassword);
      if (res?.success) {
        enqueueSnackbar("Password reset successfully", { variant: "success" });
        navigate("/login");
      } else {
        enqueueSnackbar(res?.message || "Failed to reset password", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] dark:bg-[#121212] px-4 py-10">
      {/* Floating Top Nav Buttons */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-30">
        <BackButton fallbackPath="/login" label="Back" />
        <Link
          to="/home"
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 rounded-xl shadow-xs hover:shadow-md hover:bg-white dark:hover:bg-gray-800 hover:text-[#1E88E5] dark:hover:text-[#1E88E5] transition-all cursor-pointer font-extrabold text-xs backdrop-blur-md"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition mt-12 sm:mt-0">
        <div className="mb-4">
          <BackButton fallbackPath="/login" label="Back to Login Page" />
        </div>

        <h2 className="text-3xl font-semibold text-[#1E88E5] dark:text-white mb-6">Reset Password</h2>
        <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
          Set a new password for your account <span className="font-medium">{email}</span>
        </p>

        <div className="relative w-full mb-4">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${loading ? "cursor-not-allowed" : "cursor-text"} w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]`}
            required
          />
          <button
            className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"} absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500`}
            onClick={(e) => {
              e.preventDefault();
              setShowPassword(!showPassword);
            }}
          ></button>
        </div>


        <div className="relative w-full mb-4">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`${loading ? "cursor-not-allowed" : "cursor-text"} w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]`}
            required
          />
          <button
            className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"} absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500`}
            onClick={(e) => {
              e.preventDefault();
              setShowPassword(!showPassword);
            }}
          ></button>
        </div>

        <Button
          variant="contained"
          disabled={loading}
          onClick={handleReset}
          className="w-full !bg-[#1E88E5] hover:!bg-[#6f3260] transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </div>
  );
}
