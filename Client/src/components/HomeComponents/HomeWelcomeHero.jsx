import { useContext } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { PageContentContext } from "../../context/PageContentProvider";
import company from "../../data/company.json";
import homeHeroBg from "../../assets/home_welcome_hero_bg.png";

export default function HomeWelcomeHero() {
    const { authUser, setOpenLoginDialog } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);
    const { pageContent } = useContext(PageContentContext);

    const displayCompanyName = pageContent?.companyName || company?.name || "MADHU Dairy & Daily Needs";
    const loggedInName = authUser?.firstName || authUser?.name || authAdmin?.name || null;

    return (
        <section className="relative w-full h-[32vh] min-h-[240px] sm:h-auto sm:min-h-[calc(100vh-52px)] md:min-h-[calc(100vh-54px)] overflow-hidden text-white bg-slate-900 dark:bg-slate-950 flex items-center">
            {/* 1. Full-Width Background Image */}
            <img
                src={homeHeroBg}
                alt="MADHU Dairy Home Welcome Hero"
                className="absolute inset-0 w-full h-full object-cover object-[center_25%] md:object-right z-0 brightness-105 contrast-105 saturate-105"
            />

            {/* 2. Seamless Gradient Overlays for High Legibility */}
            {/* Mobile dark overlay gradient for maximum text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-900/40 z-[1]" />
            {/* Bottom Fade transition to white page body */}
            <div className="absolute bottom-0 inset-x-0 h-8 sm:h-16 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-[1]" />

            {/* 3. Text & Action Content aligned within site grid */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-10">
                <div className="max-w-2xl space-y-2 sm:space-y-6 text-center md:text-left">
                    
                    {/* Personalized Welcome Headline */}
                    <motion.h1
                        initial={{ y: 10, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                    >
                        {loggedInName ? (
                            <div className="space-y-1">
                                <span className="block text-white text-xs sm:text-2xl font-bold opacity-95">
                                    Welcome Back,
                                </span>
                                <span className="inline-block text-2xl sm:text-5xl lg:text-6xl font-[900] text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-lime-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] py-0.5">
                                    {loggedInName}!
                                </span>
                                <span className="block text-xs sm:text-xl lg:text-2xl font-extrabold text-blue-100 opacity-95">
                                    Ready for Fresh Dairy?
                                </span>
                            </div>
                        ) : (
                            <span className="block text-lg sm:text-4xl lg:text-5xl font-[900] text-white leading-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)]">
                                Welcome to <span className="text-purple-300 drop-shadow-md">MADHU</span> Dairy & Daily Needs
                            </span>
                        )}
                    </motion.h1>

                    {/* Description Subtext */}
                    <motion.p
                        initial={{ y: 8, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xs sm:text-sm md:text-base text-white/95 font-semibold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] max-w-xl mx-auto md:mx-0"
                    >
                        {loggedInName
                            ? "Your daily dose of 100% unadulterated farm-fresh A2 milk, ghee, paneer, and sweets is ready for doorstep delivery."
                            : "Experience 100% unadulterated farm-fresh milk, ghee, paneer, and sweets sourced directly from ethical farms."}
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3.5"
                    >
                        <Link
                            to="/products"
                            className="bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-black uppercase text-xs sm:text-xs tracking-wider sm:tracking-widest px-4 py-2 sm:px-8 sm:py-3.5 rounded-lg sm:rounded-xl shadow-[0_4px_15px_rgba(132,204,22,0.5)] hover:scale-105 transition-all duration-300 border border-lime-300 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>{loggedInName ? "Order Now" : "Explore Products"}</span>
                            <span className="text-xs sm:text-base">→</span>
                        </Link>

                        {!loggedInName && (
                            <button
                                onClick={() => setOpenLoginDialog(true)}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black uppercase text-xs sm:text-xs tracking-wider sm:tracking-widest px-4 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-xl border border-white/50 transition-all duration-300 hover:scale-105 cursor-pointer shadow-md"
                            >
                                Login Account
                            </button>
                        )}
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

