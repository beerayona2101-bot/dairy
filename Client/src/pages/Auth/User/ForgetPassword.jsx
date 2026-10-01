import React, { useRef, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import { generateOtp, verifyUserByEmail } from "../../../services/userService";
import { sendOtpEmail } from "../../../services/sentOtp";
import BuffaloLoader from "../../../components/BuffaloLoader";
import { ArrowLeft, Home, Mail, KeyRound, ShieldCheck, User, ChevronRight } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeProvider";
import company from "../../../data/company.json";
import logoDarkMode from "../../../assets/logoDarkMode.png";
import logoLightMode from "../../../assets/logoLightMode.png";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { theme } = useContext(ThemeContext) || {};

  const [email, setEmail] = useState("");
  const [disableInput, setDisableInput] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sentOTP, setSentOTP] = useState("");
  const inputRefs = useRef([]);

  const brandLogo = theme === "dark" ? logoDarkMode : logoLightMode;

  function isValidEmail(val) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  }

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 4 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyEmail = async () => {
    if (!isValidEmail(email)) {
      return enqueueSnackbar("Please enter a valid email format.", { variant: "warning" });
    }

    const otpGenerated = generateOtp();
    setLoading(true);

    try {
      const res = await verifyUserByEmail(email);
      if (res?.success) {
        setDisableInput(true);

        const response = await sendOtpEmail(res?.email, otpGenerated);
        if (response?.success) {
          enqueueSnackbar("OTP sent successfully to your email!", { variant: "success" });
          setSentOTP(otpGenerated);
          setShowOtpInput(true);
        } else {
          enqueueSnackbar("Failed to send OTP email. Please try again.", { variant: "error" });
        }
      }
    } catch (error) {
      const serverMsg = error?.response?.data?.message;
      const fallbackMsg = error?.message?.includes("Network Error")
        ? "Network Error: Could not reach backend server."
        : "Something went wrong. Please check your internet connection.";
      enqueueSnackbar(serverMsg || fallbackMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 5) {
      return enqueueSnackbar("Please enter a valid 5-digit OTP.", { variant: "error" });
    } else if (enteredOtp !== sentOTP) {
      return enqueueSnackbar("Invalid OTP code. Please enter the correct OTP.", { variant: "error" });
    }

    enqueueSnackbar("Email verified successfully!", { variant: "success" });
    navigate("/login/reset-password", { state: { email } });
  };

  const handleGoBack = () => {
    if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/login");
    }
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
          onClick={() => navigate("/home")}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 rounded-full sm:rounded-xl shadow-xs hover:shadow-md hover:bg-white dark:hover:bg-gray-800 hover:text-[#1E88E5] dark:hover:text-[#1E88E5] transition-all cursor-pointer font-bold text-xs backdrop-blur-md group"
          title="Continue as Guest"
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0284C7]" />
          <span>Guest</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform -ml-0.5" />
        </button>
      </div>

      {/* Main Unified Card Container */}
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
            Forgot Password? 🔐
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {showOtpInput
              ? "Enter the 5-digit verification code sent to your email"
              : "Enter your registered email address to recover your password"}
          </p>
        </div>

        {/* Inputs Card Container */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                Registered Email
              </label>
              <div className={`group flex items-center px-4 py-3.5 rounded-xl border transition-all shadow-xs ${
                disableInput
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-80"
                  : "bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#1E88E5] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#1E88E5]/20"
              }`}>
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#1E88E5] mr-3 shrink-0 transition-colors" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  disabled={disableInput}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* OTP Section (Shown after email verification) */}
            {showOtpInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-2"
              >
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-2">
                  5-Digit Verification Code
                </label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={`forget-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-12 h-13 text-center text-lg font-black rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-white focus:border-[#1E88E5] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#1E88E5]/20 outline-none transition-all shadow-xs"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            <button
              type="button"
              disabled={loading}
              onClick={showOtpInput ? verifyOtp : verifyEmail}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#5B54F2] to-[#1E88E5] hover:from-[#4B44E2] hover:to-[#1565C0] text-white font-black text-sm tracking-wide shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <BuffaloLoader
                  variant="button"
                  text={showOtpInput ? "Verifying OTP..." : "Sending OTP..."}
                />
              ) : showOtpInput ? (
                "Verify Code & Continue"
              ) : (
                "Send Verification Code"
              )}
            </button>
          </div>
        </div>

        {/* Back to Login Footer */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Remember your password?{" "}
          <Link to="/login" className="font-extrabold text-[#0284C7] hover:underline ml-1">
            Back to Sign In
          </Link>
        </div>

        {/* Terms and Conditions Note */}
        <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
          Protected by Madhu Dairy's{" "}
          <Link
            to="/about"
            className="font-bold text-slate-600 dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-[#38BDF8] underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          &{" "}
          <Link
            to="/about"
            className="font-bold text-slate-600 dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-[#38BDF8] underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>.
        </p>
      </motion.div>
    </div>
  );
}
