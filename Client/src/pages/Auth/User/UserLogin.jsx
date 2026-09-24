import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import { loginUser } from "../../../services/userService";
import { AdminAuthContext, UserAuthContext } from "../../../context/AuthProvider";
import company from "../../../data/company.json";
import BuffaloLoader from "../../../components/BuffaloLoader";
import { Eye, EyeOff, ArrowLeft, Home, Mail, Lock, User, ChevronRight } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeProvider";
import logoDarkMode from "../../../assets/logoDarkMode.png";
import logoLightMode from "../../../assets/logoLightMode.png";

export default function UserLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { fetchUserData, handleUserLogout } = useContext(UserAuthContext);
  const { authAdmin, authAdminLoading, fetchAdminData, handleAdminLogout } = useContext(AdminAuthContext);
  const { theme } = useContext(ThemeContext) || {};

  const adminToken = sessionStorage.getItem("adminToken");
  const adminRole = sessionStorage.getItem("adminRole");
  const isValidAdmin = Boolean(authAdmin || (adminToken && adminRole === "admin"));

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  if (isValidAdmin && !authAdminLoading) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const brandLogo = theme === "dark" ? logoDarkMode : logoLightMode;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { email, password } = formData;
      const res = await loginUser(email, password);

      if (res?.success) {
        const targetPath = location.state?.from;

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
              replace: true,
            });
          } else {
            await fetchUserData(res?.user);

            enqueueSnackbar("Login Successful!", { variant: "success" });

            const storedRedirect = sessionStorage.getItem("redirectAfterLogin");
            sessionStorage.removeItem("redirectAfterLogin");

            const validUserTarget =
              (!isAuthPath(storedRedirect) && storedRedirect) ||
              (!isAuthPath(targetPath) && !targetPath.startsWith("/admin") && targetPath) ||
              "/home";

            navigate(validUserTarget, { replace: true });
          }
        }
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
      setIsLoading(false);
      setFormData({ email: "", password: "" });
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  const handleGuestLogin = () => {
    navigate("/home");
  };

  return (
    <div className="relative flex min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300 overflow-y-auto">
      {/* Floating Back Arrow */}
      <div className="absolute top-4 left-4 z-30">
        <button
          type="button"
          onClick={handleGoBack}
          className="p-2 text-gray-700 dark:text-gray-200 hover:text-[#0284C7] transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* MOBILE RESPONSE (< md): Exact matching Mobile Login Page */}
      <div className="block md:hidden w-full max-w-md mx-auto px-6 py-8 my-auto">
        {/* Brand Cow Logo Header */}
        <div className="flex flex-col items-center text-center mt-6 mb-6">
          <img
            src={brandLogo}
            alt={company?.name || "Madhu Dairy"}
            className="h-24 w-auto object-contain mb-2"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
            Farm-fresh milk & daily needs delivered to your door
          </p>
        </div>

        {/* Welcome Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome Back! 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Sign in to access your dairy subscriptions & orders
          </p>
        </div>

        {/* Inputs Card Container */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus-within:border-[#0284C7] focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all">
                <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData?.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                Password
              </label>
              <div className="flex items-center px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus-within:border-[#0284C7] focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={formData?.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Row */}
            <div className="flex justify-end pt-0.5">
              <Link
                to="/login/forget-password"
                className="text-xs font-bold text-[#0284C7] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#5B54F2] to-[#1E88E5] hover:from-[#4B44E2] hover:to-[#1565C0] text-white font-black text-sm tracking-wide shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <BuffaloLoader variant="button" text="Signing in..." />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* OR Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
          <span className="px-3 text-xs font-bold text-slate-400 uppercase">OR</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Continue as Guest Button Card */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border-1.5 border-[#0284C7]/50 hover:border-[#0284C7] shadow-sm flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0284C7]/10 border border-[#0284C7]/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#0284C7]" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                Continue as Guest
              </h4>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                Browse without signing in
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#0284C7] group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Register Now Row */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Don't have an account?{" "}
          <Link to="/signup" className="font-extrabold text-[#0284C7] hover:underline ml-1">
            Register Now
          </Link>
        </div>
      </div>

      {/* DESKTOP WEB RESPONSE (md: flex): Split Screen Layout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="hidden md:flex w-full h-screen flex-row overflow-hidden"
      >
        {/* LEFT PANEL - Brand Color Banner with Centered Brand Logo */}
        <div className="w-1/2 h-full bg-gradient-to-br from-[#1565C0] via-[#1E88E5] to-[#42A5F5] p-8 sm:p-12 lg:p-16 text-white relative flex flex-col justify-between items-center text-center overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="login-full-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-full-grid)" />
            <circle cx="80%" cy="20%" r="140" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
            <circle cx="20%" cy="80%" r="160" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10 w-full pt-8" />

          <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center w-full max-w-md">
            <div className="mb-5 flex items-center justify-center">
              <img
                src={brandLogo}
                alt={company?.name || "Brand Logo"}
                className="h-24 sm:h-28 md:h-32 lg:h-36 w-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-105"
              />
            </div>

            <p className="text-blue-100 font-medium text-sm sm:text-base mb-1 tracking-wide">
              Nice to see you again
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider text-white uppercase leading-tight">
              WELCOME BACK
            </h1>
            <div className="w-12 h-1 bg-white/90 rounded-full my-4 shadow-sm" />
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-sm font-light">
              {company?.tagline ||
                company?.description ||
                "Bringing Nature's Best, Straight to Your Home"}
            </p>
          </div>

          <div className="relative z-10 text-xs text-blue-200/70 font-medium tracking-wide pb-4">
            © {new Date().getFullYear()} {company?.name}. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL - Desktop Login Form */}
        <div className="w-1/2 h-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#161B22] text-gray-800 dark:text-gray-100 relative overflow-y-auto">
          <div className="max-w-md w-full mx-auto my-auto">
            <div className="text-center md:text-left mb-8">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E88E5] dark:text-[#42A5F5] tracking-tight">
                Login Account
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Please enter your credentials below
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="relative rounded-2xl overflow-hidden bg-[#F4F6F9] dark:bg-[#21262D] border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E88E5]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email ID"
                  value={formData?.email}
                  onChange={handleInputChange}
                  className="w-full pl-5 pr-4 py-3.5 bg-transparent text-sm sm:text-base text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none font-medium"
                  required
                />
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-[#F4F6F9] dark:bg-[#21262D] border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E88E5]" />
                <input
                  id="password"
                  name="password"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData?.password}
                  onChange={handleInputChange}
                  className="w-full pl-5 pr-11 py-3.5 bg-transparent text-sm sm:text-base text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1 transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold pt-1">
                <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-800 dark:hover:text-white transition">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5] accent-[#1E88E5] cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
                <Link
                  to="/login/forget-password"
                  className="text-[#1E88E5] dark:text-[#42A5F5] hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-full bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-sm tracking-widest uppercase shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mt-6 periodic-glass-shine"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? <BuffaloLoader variant="button" text="Logging in..." /> : "LOG IN"}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#1E88E5] dark:text-[#42A5F5] font-semibold hover:underline cursor-pointer ml-1"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}






