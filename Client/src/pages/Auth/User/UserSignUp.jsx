import React, { useState, useContext } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { verifyUserOTP } from "../../../services/userService";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import { AdminAuthContext } from "../../../context/AuthProvider";
import company from "../../../data/company.json";
import BuffaloLoader from "../../../components/BuffaloLoader";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, ChevronRight } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeProvider";
import logoDarkMode from "../../../assets/logoDarkMode.png";
import logoLightMode from "../../../assets/logoLightMode.png";
import TermsModal from "../../../components/Common/TermsModal";

export default function UserSignUp() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { theme } = useContext(ThemeContext) || {};
  const { authAdmin, authAdminLoading } = useContext(AdminAuthContext);

  const adminToken = sessionStorage.getItem("adminToken");
  const adminRole = sessionStorage.getItem("adminRole");
  const isValidAdmin = Boolean(authAdmin || (adminToken && adminRole === "admin"));

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState(null);

  if (isValidAdmin && !authAdminLoading) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const brandLogo = theme === "dark" ? logoDarkMode : logoLightMode;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidPassword = (password) => {
    return /^(?=.*\d).{8,}$/.test(password); // 8 chars, 1 number
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      return enqueueSnackbar("Please tick the checkbox to agree to the Terms and Conditions.", {
        variant: "warning",
      });
    }

    if (!isValidPassword(formData?.password)) {
      enqueueSnackbar(
        "Password must be at least 8 characters and contain a number.",
        { variant: "error" }
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return enqueueSnackbar("Passwords do not match", { variant: "error" });
    }

    try {
      setIsLoading(true);
      const res = await verifyUserOTP(formData);
      if (res?.success) {
        enqueueSnackbar(
          "Account created successfully! Credentials sent to your email.",
          { variant: "success" }
        );
        if (res?.userToken) {
          sessionStorage.setItem("userToken", res.userToken);
          sessionStorage.setItem("userRole", "user");
        }
        navigate("/signup/info-input", { state: { formData: res.user }, replace: true });
        setFormData({ email: "", password: "", confirmPassword: "" });
      } else {
        enqueueSnackbar(res?.message || "Signup failed.", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message ||
          "User already exists or server error.",
        { variant: "error" }
      );
    } finally {
      setIsLoading(false);
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

      {/* Main Unified Register Card Container (Matches UserLogin) */}
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
            Create an Account 🚀
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Join Madhu Dairy for farm-fresh dairy delivered daily
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
                  placeholder="At least 8 chars with a number"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                Confirm Password
              </label>
              <div className="group flex items-center px-4 py-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#1E88E5] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all shadow-xs">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#1E88E5] mr-3 shrink-0 transition-colors" />
                <input
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData?.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 ml-2 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Subtle Password Rule Guidance */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1E88E5]" />
              Must be at least 8 characters and contain at least 1 number
            </p>

            {/* Terms and Conditions Checklist Box */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="signup-agree-terms"
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

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#5B54F2] to-[#1E88E5] hover:from-[#4B44E2] hover:to-[#1565C0] text-white font-black text-sm tracking-wide shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <BuffaloLoader variant="button" text="Creating account..." />
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Already have an account Row */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="font-extrabold text-[#0284C7] hover:underline ml-1">
            Sign In
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
