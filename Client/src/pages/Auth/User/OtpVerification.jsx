import React, { useState, useRef, useEffect, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import { generateOtp, verifyUserOTP } from "../../../services/userService";
import { sendOtpEmail } from "../../../services/sentOtp";
import BuffaloLoader from "../../../components/BuffaloLoader";
import { ArrowLeft, Home, ShieldCheck, Mail, User, ChevronRight } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeProvider";
import company from "../../../data/company.json";
import logoDarkMode from "../../../assets/logoDarkMode.png";
import logoLightMode from "../../../assets/logoLightMode.png";

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { theme } = useContext(ThemeContext) || {};

  const formData = location?.state?.formData;
  let sentOtp = location?.state?.otp;

  const brandLogo = theme === "dark" ? logoDarkMode : logoLightMode;

  useEffect(() => {
    const otpStatus = JSON.parse(localStorage.getItem("otp-status"));
    if (otpStatus?.email === formData?.email && otpStatus?.isOtpEntered) {
      enqueueSnackbar("You already entered OTP! Proceeding to basic details...", { variant: "info" });
      navigate("/signup/info-input", { state: { formData }, replace: true });
    }
  }, [formData, navigate, enqueueSnackbar]);

  useEffect(() => {
    if (!formData) {
      navigate("/signup", { replace: true });
    }
  }, [formData, navigate]);

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    let timer;
    if (resendDisabled && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    if (timeLeft === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, timeLeft]);

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

  const resendOtp = async () => {
    try {
      const newOtpCode = generateOtp();
      const res = await sendOtpEmail(formData?.email, newOtpCode);
      if (res?.success) {
        enqueueSnackbar("OTP resent successfully to your email!", { variant: "success" });
        sentOtp = res?.otp || newOtpCode;
        setTimeLeft(120);
        setResendDisabled(true);
      } else {
        enqueueSnackbar("Failed to resend OTP. Please try again.", { variant: "error" });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Failed to resend OTP.", { variant: "error" });
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 5) {
      return enqueueSnackbar("Please enter a valid 5-digit OTP.", { variant: "error" });
    } else if (sentOtp && enteredOtp !== sentOtp) {
      return enqueueSnackbar("Invalid OTP code. Please enter the correct OTP.", { variant: "error" });
    }

    setLoading(true);
    try {
      const data = await verifyUserOTP(formData);
      if (data?.success) {
        localStorage.setItem(
          "otp-status",
          JSON.stringify({
            email: formData?.email,
            isOtpEntered: true,
          })
        );
        enqueueSnackbar("Email verified! Please complete your basic profile.", { variant: "success" });
        navigate("/signup/info-input", { state: { formData: data?.user }, replace: true });
      } else {
        enqueueSnackbar(data?.message || "OTP verification failed.", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "User already exists or server error.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/signup");
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
            alt={company?.name || "Natural Milk Dairy"}
            className="h-20 sm:h-24 w-auto object-contain mb-2 drop-shadow-xs transition-transform duration-300 hover:scale-105"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
            Farm-fresh milk & daily needs delivered to your door
          </p>
        </div>

        {/* Welcome Header */}
        <div className="mb-5 text-left">
          <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
            Verify Your Email ✉️
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Enter the 5-digit verification code sent to{" "}
            <span className="font-bold text-[#1E88E5]">{formData?.email || "your email"}</span>
          </p>
        </div>

        {/* Notice Badge */}
        <div className="mb-4 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
          <span>⚠️</span>
          <span>Please do not refresh or close this tab while verifying.</span>
        </div>

        {/* Inputs Card Container */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-2">
                5-Digit Verification Code
              </label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={`verify-otp-${index}`}
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
            </div>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {resendDisabled ? (
                  <>
                    Resend code in{" "}
                    <span className="font-bold text-[#1E88E5]">
                      {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                      {String(timeLeft % 60).padStart(2, "0")}
                    </span>
                  </>
                ) : (
                  "Didn't receive the code?"
                )}
              </span>

              {!resendDisabled && (
                <button
                  type="button"
                  onClick={resendOtp}
                  className="font-bold text-[#0284C7] hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleVerify}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#054593] to-[#1E88E5] hover:from-[#4B44E2] hover:to-[#1565C0] text-white font-black text-sm tracking-wide shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <BuffaloLoader variant="button" text="Verifying code..." />
              ) : (
                "Verify & Continue"
              )}
            </button>
          </div>
        </div>

        {/* Back to Sign Up Footer */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Wrong email address?{" "}
          <Link to="/signup" className="font-extrabold text-[#0284C7] hover:underline ml-1">
            Back to Register
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
