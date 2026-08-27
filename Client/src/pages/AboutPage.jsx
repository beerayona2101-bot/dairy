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
    <div className="min-h-screen bg-[#F0F1F3] dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Centralized Glassmorphic Logo Hero Section */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-blue-500/15 dark:bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          {/* Highlight Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-blue-200 dark:border-blue-800/60 shadow-xs mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E88E5] animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E88E5] dark:text-blue-400">
              ✨ 100% PURE & FARM-FRESH DAIRY
            </span>
          </div>

          {/* Centralized Logo Display (Without Background Box) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8 flex items-center justify-center w-full"
          >
            <img
              src={logoSrc}
              alt="Madhur Dairy Logo"
              className="h-32 sm:h-44 md:h-56 w-auto object-contain drop-shadow-[0_12px_32px_rgba(30,136,229,0.3)] transition-transform duration-500 hover:scale-105"
            />
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-4">
            About <span className="bg-gradient-to-r from-[#1E88E5] via-blue-600 to-[#1565C0] bg-clip-text text-transparent">Madhur Dairy</span> & Daily Needs
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Delivering unadulterated farm-fresh milk, pure ghee, paneer, and daily kitchen essentials straight to thousands of happy families every morning by 7 AM.
          </p>

          {/* Stats Highlight Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12 w-full">
            {[
              { value: "100%", label: "Pure & Fresh Milk", icon: "🥛" },
              { value: "7 AM", label: "Assured Doorstep Delivery", icon: "🚚" },
              { value: "100+", label: "Daily Quality Tests", icon: "🔬" },
              { value: "50,000+", label: "Happy Families Served", icon: "❤️" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/90 dark:border-gray-700/80 shadow-xs flex flex-col items-center hover:border-blue-300 dark:hover:border-blue-600/60 transition-all duration-300"
              >
                <span className="text-2xl mb-1">{stat.icon}</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Story Cards Section */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        <div className="text-center flex flex-col items-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 mb-2">
            Our Journey & Mission
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
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
