import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verifyUserOTP } from "../../../services/userService";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import company from "../../../data/company.json";
import BuffaloLoader from "../../../components/BuffaloLoader";
import { Eye, EyeOff, ArrowLeft, Home } from "lucide-react";
import logoDarkMode from "../../../assets/logoDarkMode.png";

export default function UserSignUp() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const brandLogo = logoDarkMode;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidPassword = (password) => {
    return /^(?=.*\d).{8,}$/.test(password); // 8 chars, 1 number
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

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
        localStorage.setItem("User", JSON.stringify(res.user));
        navigate("/signup/info-input", { state: { formData: res.user } });
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

  return (
    <div className="relative flex min-h-screen h-screen w-full bg-white dark:bg-[#161B22] transition-colors duration-300 overflow-hidden">
      {/* Floating Top Nav Buttons */}
      <div className="absolute top-6 left-6 right-6 sm:left-10 sm:right-10 flex items-center justify-between z-30">
        <button
          type="button"
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 rounded-xl shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 hover:text-[#1E88E5] dark:hover:text-[#1E88E5] transition-all cursor-pointer font-medium text-xs sm:text-sm backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <Link
          to="/home"
          className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 rounded-xl shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 hover:text-[#1E88E5] dark:hover:text-[#1E88E5] transition-all cursor-pointer font-medium text-xs sm:text-sm backdrop-blur-md"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* Main Full-Width & Full-Height Split Screen Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full h-full flex flex-col md:flex-row overflow-hidden"
      >
        {/* LEFT PANEL - Brand Color Banner with Centered Brand Logo */}
        <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-[#0F2742] via-[#1E88E5] to-[#1565C0] p-8 sm:p-12 lg:p-16 text-white relative flex flex-col justify-between items-center text-center overflow-hidden min-h-[320px] md:min-h-full">
          {/* Vector Background Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="signup-full-grid"
                width="36"
                height="36"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 36 0 L 0 0 0 36"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.18)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#signup-full-grid)" />
            <circle
              cx="80%"
              cy="20%"
              r="140"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
            />
            <circle
              cx="20%"
              cy="80%"
              r="160"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Top Spacer */}
          <div className="relative z-10 w-full pt-8" />

          {/* Center Brand Logo & Greeting Section */}
          <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center w-full max-w-md">
            {/* Centered Brand Logo */}
            <div className="mb-5 flex items-center justify-center">
              <img
                src={brandLogo}
                alt={company?.name || "Brand Logo"}
                className="h-24 sm:h-28 md:h-32 lg:h-36 w-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-105"
              />
            </div>

            <p className="text-blue-100 font-medium text-sm sm:text-base mb-1 tracking-wide">
              Create Your Free Account
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider text-white uppercase leading-tight">
              JOIN US TODAY
            </h1>
            <div className="w-12 h-1 bg-white/90 rounded-full my-4 shadow-sm" />
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-sm font-light">
              {company?.tagline ||
                company?.description ||
                "Bringing Nature's Best, Straight to Your Home"}
            </p>
          </div>

          {/* Bottom Accent Note */}
          <div className="relative z-10 text-xs text-blue-200/70 font-medium tracking-wide pb-4">
            © {new Date().getFullYear()} {company?.name}. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL - Form (Full Height & Centered) */}
        <div className="w-full md:w-1/2 h-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#161B22] text-gray-800 dark:text-gray-100 relative overflow-y-auto">
          <div className="max-w-md w-full mx-auto my-auto">
            {/* Title Section */}
            <div className="text-center md:text-left mb-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E88E5] dark:text-[#42A5F5] tracking-tight">
                Create Account
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Please enter your details to sign up
              </p>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Email Input Field */}
              <div className="relative rounded-2xl overflow-hidden bg-[#F4F6F9] dark:bg-[#21262D] border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E88E5]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData?.email}
                  onChange={handleInputChange}
                  className="w-full pl-5 pr-4 py-3.5 bg-transparent text-sm sm:text-base text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* Password Input Field */}
              <div className="relative rounded-2xl overflow-hidden bg-[#F4F6F9] dark:bg-[#21262D] border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E88E5]" />
                <input
                  id="password"
                  name="password"
                  placeholder="Enter your password"
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
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Confirm Password Input Field */}
              <div className="relative rounded-2xl overflow-hidden bg-[#F4F6F9] dark:bg-[#21262D] border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E88E5]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  type={showPassword ? "text" : "password"}
                  value={formData?.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-5 pr-11 py-3.5 bg-transparent text-sm sm:text-base text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1 transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 pt-1 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5] accent-[#1E88E5] cursor-pointer"
                />
                <label htmlFor="terms" className="cursor-pointer">
                  I agree to the{" "}
                  <span className="text-[#1E88E5] dark:text-[#42A5F5] font-semibold hover:underline">
                    Terms
                  </span>{" "}
                  and{" "}
                  <span className="text-[#1E88E5] dark:text-[#42A5F5] font-semibold hover:underline">
                    Privacy Policy
                  </span>
                </label>
              </div>

              {/* Submit Pill Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-full bg-[#1E88E5] hover:bg-[#1565C0] active:scale-[0.99] text-white font-bold text-sm tracking-widest uppercase shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mt-5"
              >
                {isLoading ? (
                  <BuffaloLoader variant="button" text="Signing up..." />
                ) : (
                  "SIGN UP"
                )}
              </button>
            </form>

            {/* Already have an account link */}
            <div className="mt-6 text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#1E88E5] dark:text-[#42A5F5] font-semibold hover:underline cursor-pointer ml-1"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

