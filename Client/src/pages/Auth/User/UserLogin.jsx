import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import { loginUser } from "../../../services/userService";
import { AdminAuthContext, UserAuthContext } from "../../../context/AuthProvider";
import company from "../../../data/company.json";
import BuffaloLoader from "../../../components/BuffaloLoader";
import { Eye, EyeOff, ArrowLeft, Home, Mail, Lock, ChevronRight } from "lucide-react";
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
    const previousAuthRoute = location.state?.previous;

    if (previousAuthRoute && previousAuthRoute !== "/login") {
      navigate(previousAuthRoute, { replace: true });
      return;
    }

    navigate("/home", { replace: true });
  };

  const handleGuestContinue = () => {
    sessionStorage.setItem("isGuest", "true");
    enqueueSnackbar("👋 Welcome! Continuing as Guest.", { variant: "info" });
    navigate("/", { replace: true });
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#F5F8F6] dark:bg-[#0F172A] transition-colors duration-300 flex flex-col items-center px-2.5 py-1.5 sm:px-3 sm:py-2">
      <header className="w-full max-w-[440px] lg:max-w-[1220px] h-9 shrink-0 flex items-center justify-between">
        <button
          type="button"
          onClick={handleGoBack}
          className="p-2 sm:px-3 sm:py-1.5 text-gray-700 dark:text-gray-200 hover:text-[#0284C7] dark:hover:text-[#38BDF8] transition-colors rounded-full sm:rounded-xl hover:bg-white dark:hover:bg-gray-800 shadow-2xs border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-1.5 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284C7] dark:text-[#38BDF8]" />
          <span className="hidden sm:inline text-xs font-bold">Back</span>
        </button>

        {/* Top-Right Corner Guest Option for Mobile Response */}
        <button
          type="button"
          onClick={handleGuestContinue}
          className="lg:hidden px-3.5 py-1.5 text-xs font-black text-[#0284C7] dark:text-[#38BDF8] bg-white/95 dark:bg-slate-800/95 rounded-full border border-sky-200/90 dark:border-slate-700/80 shadow-xs hover:bg-[#F0F9FF] dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          aria-label="Continue as Guest"
        >
          <span>Guest</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
        </button>
      </header>

      {/* Main Unified Login Card Container (Centered and proportioned to fit 100% viewport) */}
      <AnimatedMain
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[440px] flex-1 min-h-0 flex flex-col justify-center my-0 lg:max-w-[1220px] lg:h-[calc(100dvh-4.1rem)] lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:flex-none lg:my-0 lg:overflow-hidden lg:rounded-[26px] lg:border lg:border-slate-200/90 lg:bg-[#F8FBF9] lg:shadow-xl lg:shadow-slate-300/40 dark:lg:border-slate-800 dark:lg:bg-[#1E293B] dark:lg:shadow-black/40"
      >
        <aside className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#054593] px-8 py-8 xl:px-12 text-white">
          <img
            src={brandLogo}
            alt={company?.name || "Natural Milk Dairy"}
            className="w-44 xl:w-52 h-auto object-contain mx-auto mb-8 drop-shadow-lg"
          />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">
            Natural Milk Dairy
          </p>
          <h2 className="mt-3 text-3xl xl:text-4xl font-black leading-tight tracking-tight">
            Welcome back!
          </h2>
          <p className="mt-3 max-w-sm text-sm xl:text-base leading-relaxed text-white/85">
            Sign in to enjoy farm-fresh dairy and keep your subscriptions and orders close at hand.
          </p>
          <div className="mt-8 border-t border-white/25 pt-6">
            <p className="text-sm text-white/80">New to Natural Milk Dairy?</p>
            <Link
              to="/signup"
              state={{ previous: "/login", fromAuthFlow: true }}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/50 px-4 py-2.5 text-sm font-extrabold transition-colors hover:bg-white hover:text-[#0284C7]"
            >
              Create your account
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        <section className="flex w-full flex-col justify-center px-0 py-1.5 sm:py-2 lg:px-8 lg:py-8 xl:px-12">
          <div className="w-full max-w-[420px] mx-auto">
            {/* Brand Cow Logo Header */}
            <div className="flex flex-col items-center text-center mb-2.5 sm:mb-3 lg:hidden">
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
            <div className="mb-2 text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome Back! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Sign in to access your dairy subscriptions &amp; orders
              </p>
            </div>

            {/* Inputs Card Container */}
            <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:dark:bg-transparent">
              <form onSubmit={handleFormSubmit} className="space-y-2.5 sm:space-y-2.5">
            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                Email Address
              </label>
              <div className="group flex items-center px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-700/90 focus-within:border-[#0284C7] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all shadow-xs">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#0284C7] mr-3 shrink-0 transition-colors" />
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
              <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                Password
              </label>
              <div className="group flex items-center px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-700/90 focus-within:border-[#0284C7] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all shadow-xs">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#0284C7] mr-3 shrink-0 transition-colors" />
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
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Row */}
            <div className="flex justify-end pt-0.5">
              <Link
                to="/login/forget-password"
                className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] hover:text-[#0369A1] hover:underline"
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
                  className="w-4 h-4 mt-0.5 rounded text-[#0284C7] focus:ring-[#0284C7] focus:ring-offset-0 border-slate-300 dark:border-slate-600 dark:bg-slate-800 accent-[#0284C7] cursor-pointer shrink-0 transition-all"
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
              className="w-full min-h-[44px] py-2.5 px-4 rounded-full bg-gradient-to-r from-[#E0F2FE] via-[#F0F9FF] to-[#EBF4FF] hover:from-[#BAE6FD] hover:via-[#E0F2FE] hover:to-[#E0F2FE] text-[#0284C7] dark:text-[#38BDF8] font-black text-sm sm:text-base tracking-wide shadow-[0_8px_16px_rgba(2,132,199,0.14)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 border border-[#BAE6FD] dark:border-sky-800/60"
            >
              {isLoading ? (
                <BuffaloLoader variant="button" text="Signing in..." />
              ) : (
                "Sign In"
              )}
            </button>

            {/* Create Account Option for Mobile Response */}
            <div className="pt-2 text-center lg:hidden">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  state={{ previous: "/login", fromAuthFlow: true }}
                  className="font-black text-[#0284C7] dark:text-[#38BDF8] hover:text-[#0369A1] hover:underline cursor-pointer ml-1 inline-flex items-center gap-0.5"
                >
                  <span>Create Account</span>
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




