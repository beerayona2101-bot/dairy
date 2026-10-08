import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { UserAuthContext } from "../context/AuthProvider";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Droplet,
  Clock,
  ShieldCheck,
  Truck,
  BellOff,
  Calendar,
  Award,
  Heart,
  X,
  UserCheck
} from "lucide-react";

import cowLogo from "../assets/cowLogo.png";
import freshMilkImg from "../assets/freshMilk.jpg";
import hygienicProcessingImg from "../assets/hygienicProcessing.jpg";
import deliveryTruckImg from "../assets/deliveryTruck.jpg";
import freshProductsImg from "../assets/freshProducts.jpg";

export const ONBOARDING_SLIDES = [
  {
    id: 1,
    image: freshMilkImg,
    category: "FARM TO TABLE",
    badgeIcon: "🌿",
    badgeText: "100% PURE A2 MILK",
    metric: "⭐ 4.9 Farm Verified",
    badgeColor: "#10B981", // Emerald
    accentLight: "rgba(16, 185, 129, 0.12)",
    accentBorder: "rgba(16, 185, 129, 0.35)",
    title: "Pure & Farm-Fresh Milk",
    subtitle:
      "100% pure, unadulterated cow & buffalo milk sourced directly from ethical village dairy farms every single morning.",
    benefits: [
      {
        icon: Droplet,
        title: "Zero Adulteration",
        desc: "No added water, synthetic hormones, or chemical preservatives."
      },
      {
        icon: Clock,
        title: "Under 4-Hour Fresh",
        desc: "Milked at dawn and packaged within hours of collection."
      },
      {
        icon: Sparkles,
        title: "Rich in A2 Proteins",
        desc: "Naturally nutritious, easy to digest, and rich in natural calcium."
      }
    ]
  },
  {
    id: 2,
    image: hygienicProcessingImg,
    category: "QUALITY ASSURED",
    badgeIcon: "🛡️",
    badgeText: "4°C COLD CHAIN",
    metric: "❄️ 24+ Lab Tests",
    badgeColor: "#0284C7", // Sky Blue
    accentLight: "rgba(2, 132, 199, 0.12)",
    accentBorder: "rgba(2, 132, 199, 0.35)",
    title: "Untouched Cold-Chain Hygiene",
    subtitle:
      "Chilled to 4°C within 45 minutes of milking and maintained in continuous cold chain with automated packaging.",
    benefits: [
      {
        icon: ShieldCheck,
        title: "24+ Lab Quality Checks",
        desc: "Rigorous daily lab testing for fat, SNF, and chemical purity."
      },
      {
        icon: Award,
        title: "Sealed Cold Chain",
        desc: "Held consistently at 4°C from farm chiller to your doorstep."
      },
      {
        icon: Heart,
        title: "Touchless Packaging",
        desc: "Automated, untouched filling in sterile food-grade packs."
      }
    ]
  },
  {
    id: 3,
    image: deliveryTruckImg,
    category: "FAST & PUNCTUAL",
    badgeIcon: "⚡",
    badgeText: "BEFORE 7:00 AM",
    metric: "🚚 Sunrise Guarantee",
    badgeColor: "#D97706", // Amber
    accentLight: "rgba(217, 119, 6, 0.12)",
    accentBorder: "rgba(217, 119, 6, 0.35)",
    title: "Guaranteed Sunrise Delivery",
    subtitle:
      "Sunrise doorstep delivery before 7:00 AM 365 days a year so your morning chai, coffee, and breakfast are never delayed.",
    benefits: [
      {
        icon: Truck,
        title: "Prompt 7:00 AM Drop",
        desc: "Punctual arrival at your doorstep before your household wakes up."
      },
      {
        icon: BellOff,
        title: "Silent Ring-Free Drop",
        desc: "Delivered quietly without disturbing your family's sleep."
      },
      {
        icon: Calendar,
        title: "Flexible Subscriptions",
        desc: "Easily pause, modify, or add quantities with one tap."
      }
    ]
  },
  {
    id: 4,
    image: freshProductsImg,
    category: "ARTISAN PANTRY",
    badgeIcon: "🧀",
    badgeText: "HANDCRAFTED DAILY",
    metric: "✨ Traditional Bilona",
    badgeColor: "#3F9E18", // Purple
    accentLight: "rgba(139, 92, 246, 0.12)",
    accentBorder: "rgba(139, 92, 246, 0.35)",
    title: "Pure Ghee, Paneer & Sweets",
    subtitle:
      "Handcrafted traditional dairy products made with pure fresh cream and authentic time-honored recipes.",
    benefits: [
      {
        icon: Sparkles,
        title: "Traditional Desi Ghee",
        desc: "Slow-cooked bilona aroma with golden granular texture."
      },
      {
        icon: Award,
        title: "Fresh Malai Paneer",
        desc: "Super soft, melt-in-mouth paneer crafted fresh daily."
      },
      {
        icon: Heart,
        title: "Curd, Chaas & Sweets",
        desc: "Probiotic dahi, masala chaas, peda, and seasonal treats."
      }
    ]
  }
];

export default function MobileOnboardingCards({ forceShow = false, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, authUserLoading } = useContext(UserAuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Touch swipe tracking
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Auth-intent paths where onboarding should never appear
  const AUTH_PATHS = ["/login", "/signup", "/admin"];
  const isAuthPage = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    // Wait until auth is resolved before deciding to show
    if (authUserLoading) return;

    if (forceShow) {
      setCurrentPage(0);
      setIsOpen(true);
      return;
    }

    // Never show on auth/admin pages
    if (isAuthPage) {
      setIsOpen(false);
      return;
    }

    // If user is logged in, never show onboarding
    if (authUser) {
      setIsOpen(false);
      return;
    }

    // Show once per browser session for unauthenticated visitors (mobile AND desktop)
    const sessionKey = "onboarding_shown_this_session";
    const alreadyShown = sessionStorage.getItem(sessionKey);
    if (!alreadyShown) {
      setCurrentPage(0);
      setIsOpen(true);
    }

    // Listen to custom event so any button in the app can re-trigger it
    const handleOpenEvent = () => {
      setCurrentPage(0);
      setIsOpen(true);
    };

    window.addEventListener("openMobileOnboarding", handleOpenEvent);
    return () => {
      window.removeEventListener("openMobileOnboarding", handleOpenEvent);
    };
  }, [forceShow, authUser, authUserLoading, isAuthPage]);

  // Lock body scroll while onboarding is visible
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return null;

  const currentSlide = ONBOARDING_SLIDES[currentPage];
  const isLast = currentPage === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleComplete = (targetPath = null) => {
    // Mark as shown for this browser session so it doesn't re-appear on navigation
    sessionStorage.setItem("onboarding_shown_this_session", "1");
    setIsOpen(false);
    if (onClose) onClose();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45; // px

    if (diff > minSwipeDistance) {
      // Swiped left -> Next
      handleNext();
    } else if (diff < -minSwipeDistance) {
      // Swiped right -> Prev
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex flex-col justify-between items-center text-slate-900 select-none overflow-hidden animate-fadeIn"
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 8px)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)",
        paddingLeft: "12px",
        paddingRight: "12px"
      }}
    >
      {/* Container limited to mobile card width */}
      <div className="w-full max-w-sm flex-1 flex flex-col justify-between h-full max-h-[96vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between py-2 px-1 shrink-0">
          {/* Brand Logo Mini: NATURAL (Main) / Milk Dairy (Child) */}
          <div className="flex items-center gap-2">
            <img
              src={cowLogo}
              alt="Natural Milk Dairy"
              className="h-9 w-auto object-contain filter drop-shadow-sm"
            />
            <div className="flex flex-col items-start leading-none">
              <span className="text-white font-black text-sm tracking-tight leading-none">
                NATURAL
              </span>
              <span className="text-blue-200 font-extrabold text-[9px] tracking-widest uppercase leading-tight mt-0.5">
                Milk Dairy
              </span>
            </div>
          </div>

          {/* Step Pill + Skip Button */}
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide border shadow-sm transition-colors duration-300"
              style={{
                backgroundColor: currentSlide.accentLight,
                borderColor: currentSlide.accentBorder,
                color: currentSlide.badgeColor
              }}
            >
              {currentPage + 1} of {ONBOARDING_SLIDES.length}
            </span>

            <button
              onClick={() => handleComplete()}
              className="px-3 py-1 rounded-full text-xs font-bold text-slate-300 bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center gap-1 border border-white/10 shadow-sm"
            >
              <span>Skip</span>
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Main Swipeable Card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 flex flex-col my-1 bg-white rounded-3xl p-3.5 shadow-2xl border transition-all duration-300 overflow-y-auto max-h-[76vh]"
          style={{
            borderColor: currentSlide.accentBorder,
            boxShadow: `0 12px 35px -8px ${currentSlide.badgeColor}33`
          }}
        >
          {/* Card Hero Image Container */}
          <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-md shrink-0 bg-slate-100">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />

            {/* Bottom Dark Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />

            {/* Top Category Badge */}
            <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
              <span className="text-xs">{currentSlide.badgeIcon}</span>
              <span className="text-[10.5px] font-black text-white tracking-wider">
                {currentSlide.badgeText}
              </span>
            </div>

            {/* Bottom Metric Pill */}
            <div
              className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10.5px] font-black text-white shadow-md backdrop-blur-md"
              style={{ backgroundColor: currentSlide.badgeColor }}
            >
              {currentSlide.metric}
            </div>
          </div>

          {/* Card Typography Content */}
          <div className="mt-3 flex-1 flex flex-col">
            <span
              className="text-[11px] font-black tracking-widest uppercase"
              style={{ color: currentSlide.badgeColor }}
            >
              {currentSlide.category}
            </span>

            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
              {currentSlide.title}
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
              {currentSlide.subtitle}
            </p>

            {/* 3 Benefit Feature Pills */}
            <div className="mt-3 space-y-2">
              {currentSlide.benefits.map((benefit, idx) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-xl transition-all duration-200 border"
                    style={{
                      backgroundColor: currentSlide.accentLight,
                      borderColor: currentSlide.accentBorder
                    }}
                  >
                    <div
                      className="p-1.5 rounded-lg shrink-0 text-white shadow-sm mt-0.5"
                      style={{ backgroundColor: currentSlide.badgeColor }}
                    >
                      <IconComponent className="w-3.5 h-3.5 stroke-[2.4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-slate-900 leading-tight">
                        {benefit.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Interactive Navigation & Action Buttons */}
        <div className="shrink-0 pt-2 pb-1 space-y-2">
          {/* Smooth Expanding Dots */}
          <div className="flex justify-center items-center gap-1.5 py-1">
            {ONBOARDING_SLIDES.map((slide, index) => {
              const active = index === currentPage;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentPage(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    active ? "w-7" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  style={{
                    backgroundColor: active ? currentSlide.badgeColor : undefined
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            {/* Back Button (slide 2 onwards) */}
            {currentPage > 0 && (
              <button
                onClick={handlePrev}
                className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-md transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}

            {/* Primary Action Button (Continue / Get Started) */}
            <button
              onClick={handleNext}
              className="flex-1 h-11 px-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
              style={{
                background: isLast
                  ? "linear-gradient(135deg, #10B981 0%, #047857 100%)"
                  : `linear-gradient(135deg, ${currentSlide.badgeColor} 0%, #1E293B 140%)`,
                boxShadow: `0 6px 20px -4px ${currentSlide.badgeColor}88`
              }}
            >
              <span>{isLast ? "Get Started • Explore Products" : "Continue"}</span>
              {isLast ? (
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>

          {/* Continue as Guest Button */}
          <div className="text-center">
            <button
              onClick={() => handleComplete("/products")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white py-1 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Continue as Guest (Skip) →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

MobileOnboardingCards.propTypes = {
  forceShow: PropTypes.bool,
  onClose: PropTypes.func
};
