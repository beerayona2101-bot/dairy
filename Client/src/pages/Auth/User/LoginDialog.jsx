import React, { useContext, useState } from "react";
import { useSnackbar } from "notistack";
import { Dialog, DialogContent } from "@mui/material";
import Slide from "@mui/material/Slide";
import { AdminAuthContext, UserAuthContext } from "../../../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../../services/userService";
import company from "../../../data/company.json";
import { Eye, EyeOff, X } from "lucide-react";
import BuffaloLoader from "../../../components/BuffaloLoader";
import { ThemeContext } from "../../../context/ThemeProvider";
import logoDarkMode from "../../../assets/logoDarkMode.png";
import logoLightMode from "../../../assets/logoLightMode.png";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function LoginDialog() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { theme } = useContext(ThemeContext) || {};

  const {
    openLoginDialog,
    setOpenLoginDialog,
    handleUserLogout,
    fetchUserData,
  } = useContext(UserAuthContext);
  const { handleAdminLogout, fetchAdminData } = useContext(AdminAuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const brandLogo = theme === "dark" ? logoDarkMode : logoLightMode;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res?.success) {
        setOpenLoginDialog(false);
        if (res?.isAdmin || res?.admin) {
          handleUserLogout();
          if (res?.adminToken) {
            sessionStorage.setItem("adminToken", res.adminToken);
            sessionStorage.setItem("adminRole", "admin");
          }
          if (fetchAdminData) await fetchAdminData(res?.admin);

          enqueueSnackbar("Admin Login Successful!", { variant: "success" });
          navigate("/admin/dashboard", { replace: true });
        } else {
          handleAdminLogout();
          if (res?.userToken) {
            sessionStorage.setItem("userToken", res.userToken);
            sessionStorage.setItem("userRole", "user");
          }
          if (!res?.filledBasicInfo) {
            navigate("/signup/info-input", {
              state: { user: res?.user, viaLogin: !res?.filledBasicInfo },
            });
          } else {
            await fetchUserData(res?.user);
            enqueueSnackbar("Login Successful!", { variant: "success" });

            const storedRedirect = sessionStorage.getItem("redirectAfterLogin");
            sessionStorage.removeItem("redirectAfterLogin");

            const isAuthPath = (path) => {
              if (!path || typeof path !== "string") return true;
              const clean = path.toLowerCase();
              return (
                clean === "/login" ||
                clean === "/signup" ||
                clean === "/admin/login" ||
                clean.startsWith("/login/") ||
                clean.startsWith("/signup/")
              );
            };

            const currentPath = window.location.pathname;
            const validDest = (!isAuthPath(storedRedirect) && storedRedirect) ||
                              (!isAuthPath(currentPath) && currentPath) ||
                              "/home";

            navigate(validDest, { replace: true });
          }
        }
        setEmail("");
        setPassword("");
      } else {
        enqueueSnackbar(res?.message || "Login failed, please try again.", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Server error or invalid credentials.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={openLoginDialog}
      onClose={() => setOpenLoginDialog(false)}
      fullScreen
      slots={{
        transition: Transition,
      }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "transparent !important",
            backgroundImage: "none !important",
            boxShadow: "none !important",
            borderRadius: "0 !important",
            overflow: "hidden !important",
            margin: 0,
            width: "100vw",
            height: "100vh",
          },
        },
      }}
    >
      <DialogContent
        sx={{ overflow: "hidden !important", backgroundColor: "transparent !important", padding: 0 }}
        className="p-0 border-0 bg-transparent overflow-hidden relative w-full h-full"
      >
        {/* Close Button */}
        <button
          onClick={() => setOpenLoginDialog(false)}
          className="absolute top-6 right-6 z-30 p-2.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row w-full h-full min-h-screen overflow-hidden bg-white dark:bg-[#161B22]">
          {/* LEFT PANEL - Brand Banner */}
          <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-[#1565C0] via-[#1E88E5] to-[#42A5F5] p-8 sm:p-12 lg:p-16 text-white relative flex flex-col justify-between items-center text-center overflow-hidden">
            {/* SVG Background Pattern */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="dialog-grid"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 24 0 L 0 0 0 24"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dialog-grid)" />
              <circle
                cx="80%"
                cy="20%"
                r="70"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1.5"
              />
              <circle
                cx="20%"
                cy="80%"
                r="90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1.5"
              />
            </svg>

            {/* Spacer */}
            <div className="relative z-10 w-full" />

            {/* Middle Welcome Text with Centered Logo */}
            <div className="relative z-10 my-auto py-4 flex flex-col items-center justify-center w-full">
              {/* Centered Brand Logo */}
              <div className="mb-3 flex items-center justify-center">
                <img
                  src={brandLogo}
                  alt={company?.name || "Brand Logo"}
                  className="h-18 sm:h-22 md:h-26 w-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-105"
                />
              </div>

              <p className="text-blue-100 text-xs font-medium">
                Nice to see you again
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wider text-white uppercase mt-1">
                WELCOME BACK
              </h2>
              <div className="w-10 h-1 bg-white rounded-full my-2.5" />
              <p className="text-xs text-blue-100/90 leading-relaxed font-light max-w-xs">
                {company?.tagline ||
                  "Access your account to enjoy seamless dairy and grocery subscriptions."}
              </p>
            </div>

            <div className="relative z-10 text-[10px] text-blue-200/70 font-medium">
              © {company?.name}
            </div>
          </div>

          {/* RIGHT PANEL - Form */}
          <div className="w-full md:w-1/2 h-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#161B22] text-gray-800 dark:text-gray-100 overflow-y-auto">
            <div className="max-w-md w-full mx-auto my-auto">
              <div className="mb-6">
                <h3 className="text-3xl font-extrabold text-[#1E88E5] dark:text-[#42A5F5]">
                  Login Account
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Please enter your credentials below
                </p>
              </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div className="relative rounded-xl overflow-hidden bg-[#F4F6F9] dark:bg-[#21262D] border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E88E5]" />
                <input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-3 py-3 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative rounded-xl overflow-hidden bg-[#F4F6F9] dark:bg-[#21262D] border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E88E5]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Row */}
              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <label className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded accent-[#1E88E5]"
                  />
                  <span>Keep me signed in</span>
                </label>
                <Link
                  to="/login/forget-password"
                  onClick={() => setOpenLoginDialog(false)}
                  className="hover:underline font-semibold text-[#1E88E5] dark:text-[#42A5F5]"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] text-white font-bold text-xs sm:text-sm tracking-widest uppercase shadow-md shadow-blue-500/20 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer mt-4 periodic-glass-shine"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <BuffaloLoader variant="button" text="Logging in..." />
                  ) : (
                    "LOG IN"
                  )}
                </span>
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  onClick={() => setOpenLoginDialog(false)}
                  className="text-[#1E88E5] dark:text-[#42A5F5] font-semibold hover:underline cursor-pointer ml-1"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
  );
}

