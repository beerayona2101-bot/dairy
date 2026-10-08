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
          onClick={() => navigate("/home")}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 rounded-full sm:rounded-xl shadow-xs hover:shadow-md hover:bg-white dark:hover:bg-gray-800 hover:text-[#075C2A] dark:hover:text-[#3F9E18] transition-all cursor-pointer font-bold text-xs backdrop-blur-md group"
          title="Continue as Guest"
        >
          <User className="w-3.5 h-3.5 text-[#075C2A] dark:text-[#3F9E18]" />
          <span>Guest</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform -ml-0.5" />
        </button>
      </div>

      {/* Main Unified Card Container */}
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
        <div className="mb-2.5 sm:mb-3 text-left">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Forgot Password? 🔐
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {showOtpInput
              ? "Enter the 5-digit verification code sent to your email"
              : "Enter your registered email address to recover your password"}
          </p>
        </div>

        {/* Inputs Card Container */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-md">
          <div className="space-y-3">
            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                Registered Email
              </label>
              <div className={`group flex items-center px-3.5 py-2.5 rounded-xl border transition-all shadow-xs ${
                disableInput
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-80"
                  : "bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#075C2A] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#075C2A]/20"
              }`}>
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#075C2A] mr-2.5 shrink-0 transition-colors" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  disabled={disableInput}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* OTP Section (Shown after email verification) */}
            {showOtpInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-1"
              >
                <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                  5-Digit Verification Code
                </label>
                <div className="flex justify-between gap-1.5">
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
                      className="w-10 sm:w-12 h-11 sm:h-12 text-center text-base sm:text-lg font-black rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-white focus:border-[#075C2A] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#075C2A]/20 outline-none transition-all shadow-xs"
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
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#075C2A] to-[#054593] hover:from-[#5B4BC4] hover:to-[#4D44DB] text-white font-black text-xs sm:text-sm tracking-wide shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
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
        <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Remember your password?{" "}
          <Link to="/login" className="font-extrabold text-[#075C2A] dark:text-[#3F9E18] hover:text-[#054593] hover:underline ml-1">
            Back to Sign In
          </Link>
        </div>

        {/* Terms and Conditions Note */}
        <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
          Protected by Natural Milk Dairy's{" "}
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
