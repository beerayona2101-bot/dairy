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

    const displayCompanyName = pageContent?.companyName || company?.name || "Madhur Dairy & Daily Needs";
    const loggedInName = authUser?.firstName || authUser?.name || authAdmin?.name || null;

    let mainTitle = displayCompanyName;
    let subTitle = "";
    if (/dairy/i.test(displayCompanyName)) {
        const match = displayCompanyName.match(/^(.*?dairy)\s*(&(?:amp;)?|\band\b)?\s*(.*)$/i);
        if (match) {
            mainTitle = match[1];
            const connector = match[2] ? match[2].toUpperCase() : "AND";
            const rest = match[3];
            subTitle = rest ? `${connector} ${rest}` : "";
        }
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-4 sm:pb-6">
            {/* Glassmorphic Hero Card Container with Rounded Corners & Borders */}
            <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] rounded-[32px] sm:rounded-[36px] overflow-hidden flex items-center justify-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-white/40 dark:border-white/10 group bg-white/20 dark:bg-black/30">
                
                {/* 4K Home Page Hero Background Image with Subtle Hover Zoom */}
                <img
                    src={homeHeroBg}
                    alt="Madhur Dairy Home Welcome Hero"
                    className="absolute inset-0 w-full h-full object-cover object-center z-0 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />

                {/* Gradient Overlay for Text Readability showcasing boy drinking milk on the right */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-blue-900/40 to-transparent z-1" />

                {/* Text Content Layer - Left-to-Center layout so boy drinking milk is clearly visible on right */}
                <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-3xl mr-auto md:ml-6 space-y-4 sm:space-y-5 text-center md:text-left flex flex-col items-center md:items-start justify-center">
                    


                    {/* Personalized Welcome Headline */}
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-w-2xl text-center md:text-left space-y-1 sm:space-y-2"
                    >
                        {loggedInName ? (
                            <>
                                <span className="block text-white text-lg sm:text-2xl font-bold">Welcome Back,</span>
                                <span className="block text-3xl sm:text-5xl lg:text-6xl font-[900] text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-lime-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] py-1">
                                    {loggedInName}!
                                </span>
                                <span className="block text-base sm:text-xl lg:text-2xl font-extrabold text-blue-100 opacity-90 mt-1">
                                    Ready for Fresh Dairy?
                                </span>
                            </>
                        ) : (
                            <span className="block text-2xl sm:text-4xl lg:text-5xl font-[900] text-white">
                                Welcome to Madhur Dairy & Daily Needs
                            </span>
                        )}
                    </motion.h1>

                    {/* Description Subtext */}
                    <motion.p
                        initial={{ y: 15, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xs sm:text-sm text-emerald-50 font-bold leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] max-w-lg text-center md:text-left"
                    >
                        {loggedInName
                            ? "Your daily dose of 100% unadulterated farm-fresh A2 milk, ghee, paneer, and sweets is ready for doorstep delivery."
                            : "Experience 100% unadulterated farm-fresh milk, ghee, paneer, and sweets sourced directly from ethical farms."}
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="pt-2 flex flex-wrap items-center justify-center gap-3"
                    >
                        <Link
                            to="/products"
                            className="bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-black uppercase text-xs sm:text-sm tracking-widest px-8 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(132,204,22,0.6)] hover:scale-105 transition-all duration-300 border border-lime-300 inline-flex items-center gap-2 cursor-pointer"
                        >
                            <span>{loggedInName ? "Order Now" : "Explore Products"}</span>
                            <span className="text-base">→</span>
                        </Link>

                        {!loggedInName && (
                            <button
                                onClick={() => setOpenLoginDialog(true)}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black uppercase text-xs sm:text-sm tracking-widest px-6 py-3.5 rounded-2xl border border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer"
                            >
                                Login Account
                            </button>
                        )}
                    </motion.div>

                </div>

            </div>
        </div>
    );
}
