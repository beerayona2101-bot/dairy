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
import TermsModal from "../../../components/Common/TermsModal";

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
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState(null);
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

    if (!agreeTerms) {
      return enqueueSnackbar("Please tick the checkbox to agree to the Terms and Conditions.", {
        variant: "warning",
      });
    }

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
    <div className="relative min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Top Navigation Bar: Back & Home */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-30 pointer-events-none">
        <button
          type="button"
          onClick={handleGoBack}
          className="pointer-events-auto p-2 sm:px-3 sm:py-2 text-gray-700 dark:text-gray-200 hover:text-[#0284C7] dark:hover:text-[#38BDF8] transition-colors rounded-full sm:rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-md shadow-xs flex items-center gap-1.5 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-bold">Back</span>
        </button>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 rounded-full sm:rounded-xl shadow-xs hover:shadow-md hover:bg-white dark:hover:bg-gray-800 hover:text-[#1E88E5] dark:hover:text-[#1E88E5] transition-all cursor-pointer font-bold text-xs backdrop-blur-md group"
          title="Continue as Guest"
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0284C7]" />
          <span>Guest</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform -ml-0.5" />
        </button>
      </div>

      {/* Main Unified Login Card Container (Matches img2 on Mobile, Tablet & Desktop) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[440px] mx-auto py-8 sm:py-10"
      >
        {/* Brand Cow Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={brandLogo}
            alt={company?.name || "Madhu Dairy"}
            className="h-20 sm:h-24 w-auto object-contain mb-2 drop-shadow-xs transition-transform duration-300 hover:scale-105"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
            Farm-fresh milk & daily needs delivered to your door
          </p>
        </div>

        {/* Welcome Header */}
        <div className="mb-5 text-left">
          <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
            Welcome Back! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Sign in to access your dairy subscriptions & orders
          </p>
        </div>

        {/* Inputs Card Container */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                Email Address
              </label>
              <div className="group flex items-center px-4 py-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#1E88E5] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all shadow-xs">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#1E88E5] mr-3 shrink-0 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData?.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                Password
              </label>
              <div className="group flex items-center px-4 py-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#1E88E5] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all shadow-xs">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#1E88E5] mr-3 shrink-0 transition-colors" />
                <input
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={formData?.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 ml-2 transition-colors cursor-pointer"
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

            {/* Terms and Conditions Checklist Box */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="login-agree-terms"
                  name="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#1E88E5] focus:ring-[#1E88E5] focus:ring-offset-0 border-slate-300 dark:border-slate-600 dark:bg-slate-800 accent-[#1E88E5] cursor-pointer shrink-0 transition-all"
                  required
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-snug">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsModalTab("terms");
                    }}
                    className="font-bold text-[#0284C7] dark:text-[#38BDF8] hover:underline cursor-pointer"
                  >
                    Terms &amp; Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsModalTab("privacy");
                    }}
                    className="font-bold text-[#0284C7] dark:text-[#38BDF8] hover:underline cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
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

        {/* Register Now Row */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Don't have an account?{" "}
          <Link to="/signup" className="font-extrabold text-[#0284C7] hover:underline ml-1">
            Register Now
          </Link>
        </div>
      </motion.div>

      {/* Interactive Terms & Privacy Modal */}
      <TermsModal
        isOpen={Boolean(termsModalTab)}
        initialTab={termsModalTab || "terms"}
        onClose={() => setTermsModalTab(null)}
        onAccept={() => setAgreeTerms(true)}
      />
    </div>
  );
}






