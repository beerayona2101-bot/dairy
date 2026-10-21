import React, { useState, useContext } from "react";
import { Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { verifyUserOTP } from "../../../services/userService";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import { AdminAuthContext, UserAuthContext } from "../../../context/AuthProvider";
import company from "../../../data/company.json";
import BuffaloLoader from "../../../components/BuffaloLoader";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, ChevronRight, User as UserIcon, Phone } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeProvider";
import logoDarkMode from "../../../assets/logoDarkMode.png";
import logoLightMode from "../../../assets/logoLightMode.png";
import TermsModal from "../../../components/Common/TermsModal";
import { getFriendlyErrorMessage } from "../../../utils/errorHelper";

export default function UserSignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { theme } = useContext(ThemeContext) || {};
  const { authAdmin, authAdminLoading } = useContext(AdminAuthContext);
  const { fetchUserData } = useContext(UserAuthContext) || {};

  const adminToken = sessionStorage.getItem("adminToken");
  const adminRole = sessionStorage.getItem("adminRole");
  const isValidAdmin = Boolean(authAdmin || (adminToken && adminRole === "admin"));

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    mobileNo: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  if (isValidAdmin && !authAdminLoading) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const brandLogo = theme === "dark" ? logoDarkMode : logoLightMode;
  const AnimatedMain = motion.main;

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

    if (!formData?.username?.trim()) {
      return enqueueSnackbar("Please enter your name / username.", {
        variant: "error",
      });
    }

    const cleanMobile = formData?.mobileNo?.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      return enqueueSnackbar("Please enter a valid 10-digit mobile number.", {
        variant: "error",
      });
    }

    if (!formData?.email?.trim()) {
      return enqueueSnackbar("Please enter your email address.", {
        variant: "error",
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
      const res = await verifyUserOTP({
        username: formData.username.trim(),
        mobileNo: cleanMobile,
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res?.success) {
        enqueueSnackbar(
          "Account created successfully! Welcome to Natural Milk Dairy 🎉",
          { variant: "success" }
        );

        if (res?.userToken) {
          sessionStorage.setItem("userToken", res.userToken);
          sessionStorage.setItem("userRole", "user");
          localStorage.setItem("userToken", res.userToken);
          localStorage.setItem("userRole", "user");
        }

        if (fetchUserData) {
          try {
            await fetchUserData(res.user);
          } catch (syncErr) {
            console.warn("User data sync warning:", syncErr?.message);
          }
        }

        sessionStorage.removeItem("redirectAfterLogin");
        navigate("/", { replace: true });
        setFormData({
          username: "",
          mobileNo: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        enqueueSnackbar(res?.message || "Signup failed.", { variant: "error" });
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        getFriendlyErrorMessage(error, "An account with this email address or mobile number already exists.");
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    const previousAuthRoute = location.state?.previous;

    if (previousAuthRoute === "/login") {
      navigate(previousAuthRoute, { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  };

  const handleGuestContinue = () => {
    sessionStorage.setItem("isGuest", "true");
    enqueueSnackbar("👋 Welcome! Continuing as Guest.", { variant: "info" });
    navigate("/", { replace: true });
  };

  return (
    <div className="relative min-h-[100dvh] lg:h-[100dvh] w-full overflow-y-auto lg:overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300 flex flex-col items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
      <header className="w-full max-w-[440px] lg:max-w-[1220px] h-9 shrink-0 flex items-center justify-between">
        <button
          type="button"
          onClick={handleGoBack}
          className="w-8.5 h-8.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#075C2A] dark:text-[#3F9E18] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-[#075C2A] dark:text-[#3F9E18]" />
        </button>

        {/* Top-Right Corner Guest Option */}
        <button
          type="button"
          onClick={handleGuestContinue}
          className="lg:hidden px-3 py-1 text-xs font-black text-[#075C2A] dark:text-[#3F9E18] bg-white dark:bg-slate-800 rounded-full border border-green-300 dark:border-green-700 shadow-xs hover:bg-green-50 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          aria-label="Continue as Guest"
        >
          <span>Guest</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#075C2A] dark:text-[#3F9E18]" />
        </button>
      </header>

      {/* Main Unified Register Card Container (Centered and proportioned to fit 100% viewport) */}
      <AnimatedMain
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[440px] flex-1 min-h-0 flex flex-col justify-center my-0 lg:max-w-[1220px] lg:h-[calc(100dvh-4.1rem)] lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:flex-none lg:my-0 lg:overflow-hidden lg:rounded-[26px] lg:border lg:border-slate-200/90 lg:bg-[#F8FBF9] lg:shadow-xl lg:shadow-slate-300/40 dark:lg:border-slate-800 dark:lg:bg-[#1E293B] dark:lg:shadow-black/40"
      >
        <aside className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#075C2A] via-[#08713A] to-[#054593] px-8 py-8 xl:px-12 text-white">
          <img
            src={brandLogo}
            alt={company?.name || "Natural Milk Dairy"}
            className="w-44 xl:w-52 h-auto object-contain mx-auto mb-8 drop-shadow-lg"
          />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">
            Natural Milk Dairy
          </p>
          <h2 className="mt-3 text-3xl xl:text-4xl font-black leading-tight tracking-tight">
            Welcome to the family!
          </h2>
          <p className="mt-3 max-w-sm text-sm xl:text-base leading-relaxed text-white/85">
            Create your account for fresh, farm-to-door dairy and an easier way to manage your daily essentials.
          </p>
          <div className="mt-8 border-t border-white/25 pt-6">
            <p className="text-sm text-white/80">Already have an account?</p>
            <Link
              to="/login"
              state={{ previous: "/signup", fromAuthFlow: true }}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/50 px-4 py-2.5 text-sm font-extrabold transition-colors hover:bg-white hover:text-[#075C2A]"
            >
              Sign in
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        <section className="flex w-full flex-col justify-center px-0 py-1 sm:py-2 lg:px-8 lg:py-8 xl:px-12">
          <div className="w-full max-w-[440px] mx-auto">
            {/* Brand Cow Logo Header */}
            <div className="flex flex-col items-center text-center mb-2 lg:hidden">
              <img
                src={brandLogo}
                alt={company?.name || "Natural Milk Dairy"}
                className="h-14 sm:h-16 w-auto object-contain mb-0.5 drop-shadow-md transition-transform duration-300 hover:scale-105"
              />
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
                Farm-fresh milk &amp; daily needs delivered to your door
              </p>
            </div>

            {/* Welcome Header */}
            <div className="mb-2 text-left">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Create an Account 🚀
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Join Natural Milk Dairy for farm-fresh dairy delivered daily
              </p>
            </div>

            {/* Inputs Card Container */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-black/40 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:dark:bg-transparent">
              <form onSubmit={handleFormSubmit} className="space-y-1.5 sm:space-y-2">
                {/* 1. User Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                    User Name
                  </label>
                  <div className="group flex items-center px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#0284C7] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all shadow-xs">
                    <UserIcon className="w-4 h-4 text-slate-400 group-focus-within:text-[#0284C7] mr-2 shrink-0 transition-colors" />
                    <input
                      type="text"
                      name="username"
                      placeholder="e.g. John Doe"
                      value={formData?.username}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                    Mobile Number
                  </label>
                  <div className="group flex items-center px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#0284C7] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all shadow-xs">
                    <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-[#0284C7] mr-2 shrink-0 transition-colors" />
                    <input
                      type="tel"
                      name="mobileNo"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={formData?.mobileNo}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) {
                          setFormData((prev) => ({ ...prev, mobileNo: val }));
                        }
                      }}
                      className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 3. Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                    Email Address
                  </label>
                  <div className="group flex items-center px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#0284C7] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all shadow-xs">
                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#0284C7] mr-2 shrink-0 transition-colors" />
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

                {/* 4. Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                    Password
                  </label>
                  <div className="group flex items-center px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#0284C7] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all shadow-xs">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#0284C7] mr-1.5 shrink-0 transition-colors" />
                    <input
                      name="password"
                      placeholder="At least 8 chars"
                      type={showPassword ? "text" : "password"}
                      value={formData?.password}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 ml-1 transition-colors cursor-pointer"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 5. Confirm Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                    Confirm Password
                  </label>
                  <div className="group flex items-center px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#0284C7] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all shadow-xs">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#0284C7] mr-1.5 shrink-0 transition-colors" />
                    <input
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData?.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 ml-1 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

            {/* Subtle Password Rule Guidance */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
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
                  className="w-3.5 h-3.5 mt-0.5 rounded text-[#0284C7] focus:ring-[#0284C7] focus:ring-offset-0 border-slate-300 dark:border-slate-600 dark:bg-slate-800 accent-[#0284C7] cursor-pointer shrink-0 transition-all"
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
              className="w-full min-h-[44px] py-2.5 px-4 rounded-full bg-gradient-to-r from-[#E0F2FE] via-[#F0F9FF] to-[#EBF4FF] hover:from-[#BAE6FD] hover:via-[#E0F2FE] hover:to-[#E0F2FE] text-[#0284C7] dark:text-[#38BDF8] font-black text-xs sm:text-sm tracking-wide shadow-[0_8px_16px_rgba(2,132,199,0.14)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 border border-[#BAE6FD] dark:border-sky-800/60"
            >
              {isLoading ? (
                <BuffaloLoader variant="button" text="Creating account..." />
              ) : (
                "Create Account"
              )}
            </button>

            {/* Sign In Option for Mobile Response */}
            <div className="pt-2 text-center lg:hidden">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={{ previous: "/signup", fromAuthFlow: true }}
                  className="font-black text-[#0284C7] dark:text-[#38BDF8] hover:text-[#0369A1] hover:underline cursor-pointer ml-1 inline-flex items-center gap-0.5"
                >
                  <span>Sign In</span>
                  <ChevronRight className="w-3.5 h-3.5 inline text-[#0284C7] dark:text-[#38BDF8]" />
                </Link>
              </p>
            </div>
              </form>
            </div>
          </div>
        </section>
      </AnimatedMain>

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
