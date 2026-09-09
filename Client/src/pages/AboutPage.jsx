import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import ProductProcess from "../components/ProductProcess";
import logoLightMode from "../assets/logoLightMode.png";
import logoDarkMode from "../assets/logoDarkMode.png";
import company from "../data/company.json";
import AboutCard from "../components/AboutComponents/AboutCard";
import aboutData from "../data/about.json";
import { ThemeContext } from "../context/ThemeProvider";
import MadhurLoader from "../components/MadhurLoader";

export default function AboutPage() {
  const { theme } = useContext(ThemeContext) || { theme: "light" };
  const logoSrc = theme === "dark"
    ? (company?.logoDaraTheme || logoDarkMode)
    : (company?.logoLightTheme || logoLightMode);

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const handleWindowLoad = () => {
      setPageLoading(false);
    };

    if (document.readyState === "complete") {
      handleWindowLoad();
    } else {
      window.addEventListener("load", handleWindowLoad);
    }

    return () => {
      window.removeEventListener("load", handleWindowLoad);
    };
  }, []);

  if (pageLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black">
        <MadhurLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-white transition-colors duration-300">
      {/* Centralized Logo Hero Section (100% Viewport Height, Perfectly Fitted & Styled Cards) */}
      <section className="relative w-full min-h-[calc(100vh-54px)] flex flex-col justify-center items-center py-4 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
        {/* Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-400/15 dark:bg-emerald-600/20 blur-[130px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full"
        >
          {/* Highlight Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-emerald-300/60 dark:border-emerald-700/60 shadow-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#477A50] dark:text-emerald-400">
              ✨ 100% PURE & FARM-FRESH DAIRY
            </span>
          </div>

          {/* Centralized Logo Display */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 flex items-center justify-center w-full"
          >
            <img
              src={logoSrc}
              alt="Madhur Dairy Logo"
              className="h-20 sm:h-28 md:h-32 w-auto object-contain drop-shadow-[0_8px_24px_rgba(71,122,80,0.25)] transition-transform duration-500 hover:scale-105"
            />
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
            About <span className="text-[#477A50] dark:text-emerald-400">Madhur Dairy</span> & Daily Needs
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 max-w-xl leading-relaxed font-semibold mb-6">
            Delivering unadulterated farm-fresh milk, pure ghee, paneer, and daily kitchen essentials straight to thousands of happy families every morning by 7 AM.
          </p>

          {/* Stats Highlight Grid - Premium Complete Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
            {[
              { value: "100%", label: "Pure & Fresh Milk", icon: "🥛", color: "#477A50" },
              { value: "7 AM", label: "Doorstep Delivery", icon: "🚚", color: "#00ACC1" },
              { value: "100+", label: "Quality Tests", icon: "🔬", color: "#6C5CE7" },
              { value: "50,000+", label: "Happy Families", icon: "❤️", color: "#FF7675" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-4 sm:p-5 rounded-[22px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-emerald-500/20 dark:border-emerald-500/30 shadow-[0_8px_25px_rgba(23,63,42,0.07)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer"
              >
                <div
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-xl mb-2 border border-slate-200/50 dark:border-slate-800 group-hover:scale-110 transition-transform duration-300"
                >
                  {stat.icon}
                </div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-gray-300 text-center mt-1">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Story Cards Section */}
      <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        <div className="text-center flex flex-col items-center mb-8 max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 mb-2">
            Our Journey & Mission
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            WHO WE ARE
          </h2>

          <div className="flex items-center gap-2 mt-3">
            <div className="w-10 h-[3px] rounded-full bg-[#1E88E5]"></div>
            <div className="w-2.5 h-2.5 bg-[#1E88E5] rotate-45 rounded-xs"></div>
            <div className="w-10 h-[3px] rounded-full bg-[#1E88E5]"></div>
          </div>
        </div>

        {aboutData.map((card, index) => (
          <AboutCard key={index} {...card} reverse={index % 2 === 0} />
        ))}
      </section>

      <ProductProcess />
    </div>
  );
}
