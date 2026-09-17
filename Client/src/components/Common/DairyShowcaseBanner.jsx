import React from "react";
import { motion } from "framer-motion";
import AnimatedHeading from "./AnimatedHeading";
import madhuLineupFullwidth from "../../assets/madhu_dairy_lineup_fullwidth.png";

const FEATURES = [
  {
    id: "pure-fresh",
    label: "Pure & Fresh",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.5 2 5 6 5 10.5C5 15.5 8.5 20 12 22C15.5 20 19 15.5 19 10.5C19 6 15.5 2 12 2Z" />
        <line x1="12" y1="2" x2="12" y2="22" strokeLinecap="round" />
        <line x1="5.5" y1="10" x2="18.5" y2="10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "trusted-quality",
    label: "Trusted Quality",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L14.09 8.26L20.18 9.27L15.64 13.69L16.73 19.82L12 17.27L7.27 19.82L8.36 13.69L3.82 9.27L9.91 8.26L12 2Z" />
      </svg>
    ),
  },
  {
    id: "healthier-you",
    label: "For a Healthier You",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
];

export default function DairyShowcaseBanner() {
  const handleDownloadApp = () => {
    alert("Madhu Dairy Mobile App will be available soon on Play Store & App Store!");
  };

  return (
    <section className="hidden md:block w-full bg-white dark:bg-[#0d1117] transition-colors duration-300 overflow-x-hidden pt-12 sm:pt-16 pb-10 sm:pb-14">

      {/* ── Centered content: Heading + Subtitle + Features ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">

        {/* HEADING */}
        <AnimatedHeading
          blackText="Madhu Dairy"
          violetText="Wide Range of Products"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-black text-[#1a2340] dark:text-white tracking-tight leading-tight justify-center mb-2"
          violetClassName="bg-gradient-to-r from-[#1E88E5] to-[#6C5CE7] bg-clip-text text-transparent"
        />

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium mb-6 sm:mb-7"
        >
          Download the App and explore our wide range of products.
        </motion.p>

        {/* FEATURE HIGHLIGHTS — horizontal row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="flex flex-wrap justify-center gap-5 sm:gap-8 md:gap-12 mb-0"
        >
          {FEATURES.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full border border-[#1E88E5]/30 dark:border-[#6C5CE7]/40 text-[#1E88E5] dark:text-[#A29BFE] bg-blue-50/60 dark:bg-blue-950/20 flex-shrink-0">
                {f.icon}
              </span>
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-semibold whitespace-nowrap">
                {f.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── FULL-WIDTH PRODUCT IMAGE (breaks out of any container) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="w-full mt-0"
      >
        <img
          src={madhuLineupFullwidth}
          alt="Madhu Dairy Wide Range of Products - A2 Milk, Milk, Cow Ghee, Paneer, Curd, Butter, Lassi, Sweet Peda with milk splash"
          className="w-full h-auto object-cover object-center block"
          style={{ maxHeight: "clamp(220px, 38vw, 560px)" }}
          loading="lazy"
        />
      </motion.div>

      {/* ── DOWNLOAD APP BUTTON — centered below image ── */}
      <div className="flex justify-center mt-6 sm:mt-8 px-4">
        <motion.button
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{
            scale: 1.06,
            opacity: [1, 0.72, 1],
            boxShadow: [
              "0 8px 22px rgba(30,136,229,0.4)",
              "0 0 38px rgba(108,92,231,0.9)",
              "0 8px 22px rgba(30,136,229,0.4)"
            ],
            transition: {
              duration: 1.1,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadApp}
          className="inline-flex items-center gap-3 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base bg-gradient-to-r from-[#1E88E5] to-[#6C5CE7] hover:from-[#1565C0] hover:to-[#5b4cc4] text-white shadow-[0_8px_22px_rgba(30,136,229,0.38)] transition-all duration-300 cursor-pointer border border-white/20 focus:outline-none focus:ring-4 focus:ring-blue-300/50 select-none periodic-glass-shine btn-reflection"
          aria-label="Download the Madhu Dairy App"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download App</span>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

    </section>
  );
}
