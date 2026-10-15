import React, { useContext, useState } from "react";
import { useSnackbar } from "notistack";
import { Dialog, DialogContent } from "@mui/material";
import Slide from "@mui/material/Slide";
import { AdminAuthContext, UserAuthContext } from "../../../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../../services/userService";
import company from "../../../data/company.json";
import { Eye, EyeOff, X, ArrowLeft, Mail, Lock, User, ChevronRight } from "lucide-react";
import BuffaloLoader from "../../../components/BuffaloLoader";
import { ThemeContext } from "../../../context/ThemeProvider";
import logoDarkMode from "../../../assets/logoDarkMode.png";
import logoLightMode from "../../../assets/logoLightMode.png";
import { getFriendlyErrorMessage } from "../../../utils/errorHelper";

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
        const errorMsg = getFriendlyErrorMessage(res?.message || "401 Error: Invalid email or password.");
        enqueueSnackbar(errorMsg, { variant: "error" });
      }
    } catch (error) {
      const errorMsg = getFriendlyErrorMessage(error, "500 Error: Server error or invalid credentials.");
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      fullScreen
      open={openLoginDialog}
      onClose={() => setOpenLoginDialog(false)}
      slots={{
        transition: Transition,
      }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: theme === "dark" ? "#0F172A" : "#F8FAFC",
            backgroundImage: "none",
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            maxHeight: "100vh",
            margin: 0,
            borderRadius: 0,
            overflowY: "auto",
          },
        },
      }}
    >
      <DialogContent
        sx={{
          backgroundColor: "transparent",
          padding: 0,
          overflowY: "auto",
        }}
        className="p-0 border-0 bg-transparent relative w-full h-full min-h-screen"
      >
        <div className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors">
          {/* Top Navigation Row: Back Button on Left, Guest & Close on Right */}
          <div className="w-full flex items-center justify-between z-20">
            <button
              type="button"
              onClick={() => setOpenLoginDialog(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-xs cursor-pointer text-xs font-bold transition-all hover:scale-105"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpenLoginDialog(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-xs cursor-pointer text-xs font-bold transition-all hover:scale-105"
                title="Continue browsing as Guest"
              >
                <User className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Guest</span>
              </button>

              <button
                type="button"
                onClick={() => setOpenLoginDialog(false)}
                className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-xs cursor-pointer transition-all hover:scale-105"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Login Card Form */}
          <div className="w-full max-w-[420px] mx-auto my-auto py-3 sm:py-4">
            {/* Brand Cow Logo Header */}
            <div className="flex flex-col items-center text-center mb-3">
              <img
                src={brandLogo}
                alt={company?.name || "Natural Milk Dairy"}
                className="h-14 sm:h-16 w-auto object-contain mb-1 drop-shadow-xs transition-transform duration-300 hover:scale-105"
              />
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
                Farm-fresh milk & daily needs delivered to your door
              </p>
            </div>

            {/* Welcome Header */}
            <div className="mb-3 text-left">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome Back! 👋
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Sign in to access your dairy subscriptions & orders
              </p>
            </div>

            {/* Inputs Card Container */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-md">
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                    Email Address
                  </label>
                  <div className="group flex items-center px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#075C2A] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#075C2A]/20 transition-all shadow-xs">
                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#075C2A] mr-2.5 shrink-0 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                    Password
                  </label>
                  <div className="group flex items-center px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#075C2A] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#075C2A]/20 transition-all shadow-xs">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#075C2A] mr-2.5 shrink-0 transition-colors" />
                    <input
                      name="password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 ml-1.5 transition-colors cursor-pointer"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Row */}
                <div className="flex justify-end pt-0.5">
                  <Link
                    to="/login/forget-password"
                    onClick={() => setOpenLoginDialog(false)}
                    className="text-[11px] font-bold text-[#075C2A] dark:text-[#3F9E18] hover:text-[#054593] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#075C2A] to-[#054593] hover:from-[#5B4BC4] hover:to-[#4D44DB] text-white font-black text-xs sm:text-sm tracking-wide shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50"
                >
                  {loading ? (
                    <BuffaloLoader variant="button" text="Signing in..." />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>

            {/* Register Now Row */}
            <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{" "}
              <Link
                to="/signup"
                onClick={() => setOpenLoginDialog(false)}
                className="font-extrabold text-[#075C2A] dark:text-[#3F9E18] hover:text-[#054593] hover:underline ml-1"
              >
                Register Now
              </Link>
            </div>

            {/* Terms and Conditions Note */}
            <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              By signing in, you agree to Natural Milk Dairy's{" "}
              <Link
                to="/about"
                onClick={() => setOpenLoginDialog(false)}
                className="font-bold text-slate-600 dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-[#38BDF8] underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2 transition-colors"
              >
                Terms of Service
              </Link>{" "}
              &{" "}
              <Link
                to="/about"
                onClick={() => setOpenLoginDialog(false)}
                className="font-bold text-slate-600 dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-[#38BDF8] underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2 transition-colors"
              >
                Privacy Policy
              </Link>.
            </p>
          </div>

          {/* Bottom spacing */}
          <div className="h-4" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
