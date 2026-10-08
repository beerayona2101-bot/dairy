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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  if (isValidAdmin && !authAdminLoading) {
    return <Navigate to="/admin/dashboard" replace />;
  }

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
    <div className="relative min-h-screen lg:h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300 flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto lg:overflow-hidden">
      {/* Top Navigation Bar: Back & Guest */}
      <div className="absolute top-3 left-4 right-4 sm:top-5 sm:left-6 sm:right-6 flex items-center justify-between z-30 pointer-events-none">
        <button
          type="button"
          onClick={handleGoBack}
          className="pointer-events-auto p-1.5 sm:px-3 sm:py-1.5 text-gray-700 dark:text-gray-200 hover:text-[#075C2A] dark:hover:text-[#3F9E18] transition-colors rounded-full sm:rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-md shadow-xs flex items-center gap-1.5 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#075C2A] dark:text-[#3F9E18]" />
          <span className="hidden sm:inline text-xs font-bold">Back</span>
        </button>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 rounded-full sm:rounded-xl shadow-xs hover:shadow-md hover:bg-white dark:hover:bg-gray-800 hover:text-[#075C2A] dark:hover:text-[#3F9E18] transition-all cursor-pointer font-bold text-xs backdrop-blur-md group"
          title="Continue as Guest"
        >
          <User className="w-3.5 h-3.5 text-[#075C2A] dark:text-[#3F9E18]" />
          <span>Guest</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform -ml-0.5" />
        </button>
      </div>

      {/* Main Unified Register Card Container (Matches UserLogin) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[420px] mx-auto my-auto py-2 sm:py-3 flex flex-col justify-center"
      >
        {/* Brand Cow Logo Header */}
        <div className="flex flex-col items-center text-center mb-2 sm:mb-2.5">
          <img
            src={brandLogo}
            alt={company?.name || "Natural Milk Dairy"}
            className="h-12 sm:h-14 w-auto object-contain mb-1 drop-shadow-xs transition-transform duration-300 hover:scale-105"
          />
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
            Farm-fresh milk & daily needs delivered to your door
          </p>
        </div>

        {/* Welcome Header */}
        <div className="mb-2 sm:mb-2.5 text-left">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Create an Account 🚀
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Join Natural Milk Dairy for farm-fresh dairy delivered daily
          </p>
        </div>

        {/* Inputs Card Container */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-md">
          <form onSubmit={handleFormSubmit} className="space-y-2.5 sm:space-y-3">
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
                  value={formData?.email}
                  onChange={handleInputChange}
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
                  placeholder="At least 8 chars with a number"
                  type={showPassword ? "text" : "password"}
                  value={formData?.password}
                  onChange={handleInputChange}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                Confirm Password
              </label>
              <div className="group flex items-center px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#075C2A] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#075C2A]/20 transition-all shadow-xs">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#075C2A] mr-2.5 shrink-0 transition-colors" />
                <input
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData?.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 ml-1.5 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Subtle Password Rule Guidance */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#075C2A]" />
              Must be at least 8 characters and contain at least 1 number
            </p>

            {/* Terms and Conditions Checklist Box */}
            <div className="pt-0.5">
              <label className="flex items-start gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="signup-agree-terms"
                  name="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded text-[#075C2A] focus:ring-[#075C2A] focus:ring-offset-0 border-slate-300 dark:border-slate-600 dark:bg-slate-800 accent-[#075C2A] cursor-pointer shrink-0 transition-all"
                  required
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-snug">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsModalTab("terms");
                    }}
                    className="font-bold text-[#075C2A] dark:text-[#3F9E18] hover:underline cursor-pointer"
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
                    className="font-bold text-[#075C2A] dark:text-[#3F9E18] hover:underline cursor-pointer"
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
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#075C2A] to-[#054593] hover:from-[#5B4BC4] hover:to-[#4D44DB] text-white font-black text-xs sm:text-sm tracking-wide shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
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
        <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="font-extrabold text-[#075C2A] dark:text-[#3F9E18] hover:text-[#054593] hover:underline ml-1">
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
