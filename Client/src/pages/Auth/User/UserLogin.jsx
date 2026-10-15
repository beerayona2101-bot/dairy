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
import { getFriendlyErrorMessage } from "../../../utils/errorHelper";

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
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [termsModalTab, setTermsModalTab] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  if (isValidAdmin && !authAdminLoading) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const brandLogo = theme === "dark" ? logoDarkMode : logoLightMode;
  const AnimatedMain = motion.main;

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
        const errorMsg = getFriendlyErrorMessage(res?.message || "401 Error: Login failed, please check your credentials.");
        enqueueSnackbar(errorMsg, {
          variant: "error",
        });
      }
    } catch (error) {
      const errorMsg = getFriendlyErrorMessage(error, "500 Error: Server error or invalid credentials.");
      enqueueSnackbar(errorMsg, { variant: "error" });
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
    <div className="relative min-h-[100dvh] w-full bg-[#FAFBFD] dark:bg-[#0F172A] transition-colors duration-300 flex flex-col justify-between items-center px-4 py-3 sm:py-5 overflow-y-auto">
      {/* Top Header Navigation: Back & Guest */}
      <header className="w-full max-w-[440px] lg:max-w-6xl flex items-center justify-between shrink-0 pt-1 pb-1">
        <button
          type="button"
          onClick={handleGoBack}
          className="p-2 sm:px-3.5 sm:py-2 text-gray-700 dark:text-gray-200 hover:text-[#075C2A] dark:hover:text-[#3F9E18] transition-colors rounded-full sm:rounded-xl hover:bg-white dark:hover:bg-gray-800 shadow-2xs border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-1.5 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#075C2A] dark:text-[#3F9E18]" />
          <span className="hidden sm:inline text-xs font-bold">Back</span>
        </button>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 rounded-full sm:rounded-xl shadow-xs hover:shadow-md hover:bg-white dark:hover:bg-gray-800 hover:text-[#075C2A] dark:hover:text-[#3F9E18] transition-all cursor-pointer font-bold text-xs group"
          title="Continue as Guest"
        >
          <User className="w-3.5 h-3.5 text-[#075C2A] dark:text-[#3F9E18]" />
          <span>Guest</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform -ml-0.5" />
        </button>
      </header>

      {/* Main Unified Login Card Container (Centered and proportioned to fit 100% viewport) */}
      <AnimatedMain
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[440px] flex-1 flex flex-col justify-center my-auto py-2 sm:py-3 lg:max-w-6xl lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:flex-none lg:my-6 lg:overflow-hidden lg:rounded-[32px] lg:border lg:border-slate-200/90 lg:bg-white lg:shadow-2xl lg:shadow-slate-300/40 dark:lg:border-slate-800 dark:lg:bg-[#1E293B] dark:lg:shadow-black/40"
      >
        <aside className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-[#075C2A] via-[#08713A] to-[#054593] px-10 py-12 xl:px-14 text-white">
          <img
            src={brandLogo}
            alt={company?.name || "Natural Milk Dairy"}
            className="w-52 xl:w-60 h-auto object-contain self-start mb-10 drop-shadow-lg"
          />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">
            Natural Milk Dairy
          </p>
          <h2 className="mt-3 text-4xl xl:text-5xl font-black leading-tight tracking-tight">
            Welcome back!
          </h2>
          <p className="mt-4 max-w-sm text-base xl:text-lg leading-relaxed text-white/85">
            Sign in to enjoy farm-fresh dairy and keep your subscriptions and orders close at hand.
          </p>
          <div className="mt-10 border-t border-white/25 pt-7">
            <p className="text-sm text-white/80">New to Natural Milk Dairy?</p>
            <Link
              to="/signup"
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/50 px-5 py-3 text-sm font-extrabold transition-colors hover:bg-white hover:text-[#075C2A]"
            >
              Create your account
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        <section className="flex w-full flex-col justify-center px-0 py-2 sm:py-3 lg:px-10 lg:py-12 xl:px-14">
          <div className="w-full max-w-[440px] mx-auto">
            {/* Brand Cow Logo Header */}
            <div className="flex flex-col items-center text-center mb-3 sm:mb-4 lg:hidden">
              <img
                src={brandLogo}
                alt={company?.name || "Natural Milk Dairy"}
                className="h-28 sm:h-32 w-auto object-contain mb-2 drop-shadow-md transition-transform duration-300 hover:scale-105"
              />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs">
                Farm-fresh milk &amp; daily needs delivered to your door
              </p>
            </div>

            {/* Welcome Header */}
            <div className="mb-2.5 sm:mb-3.5 text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome Back! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Sign in to access your dairy subscriptions &amp; orders
              </p>
            </div>

            {/* Inputs Card Container */}
            <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:dark:bg-transparent">
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                Email Address
              </label>
              <div className="group flex items-center px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-700/90 focus-within:border-[#075C2A] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#075C2A]/20 transition-all shadow-xs">
                <Mail className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#075C2A] mr-3 shrink-0 transition-colors" />
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
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                Password
              </label>
              <div className="group flex items-center px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-700/90 focus-within:border-[#075C2A] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#075C2A]/20 transition-all shadow-xs">
                <Lock className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#075C2A] mr-3 shrink-0 transition-colors" />
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
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 ml-1.5 transition-colors cursor-pointer"
                >
                  {showPassword ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Row */}
            <div className="flex justify-end pt-0.5">
              <Link
                to="/login/forget-password"
                className="text-xs font-bold text-[#075C2A] dark:text-[#3F9E18] hover:text-[#054593] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Terms and Conditions Checklist Box */}
            <div className="pt-0.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="login-agree-terms"
                  name="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#075C2A] focus:ring-[#075C2A] focus:ring-offset-0 border-slate-300 dark:border-slate-600 dark:bg-slate-800 accent-[#075C2A] cursor-pointer shrink-0 transition-all"
                  required
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#075C2A] via-[#054593] to-[#0756B5] hover:from-[#054593] hover:to-[#075C2A] text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-[#075C2A]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {isLoading ? (
                <BuffaloLoader variant="button" text="Signing in..." />
              ) : (
                "Sign In"
              )}
            </button>
              </form>
            </div>
          </div>
        </section>
      </AnimatedMain>

      {/* Footer: Register Now Row */}
      <footer className="w-full max-w-[440px] pt-2 pb-1 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium shrink-0 lg:hidden">
        Don't have an account?{" "}
        <Link to="/signup" className="font-extrabold text-[#075C2A] dark:text-[#3F9E18] hover:text-[#054593] hover:underline ml-1">
          Register Now
        </Link>
      </footer>

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




