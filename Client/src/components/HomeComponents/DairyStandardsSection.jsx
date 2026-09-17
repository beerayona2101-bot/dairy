import { motion } from "framer-motion";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Link } from "react-router-dom";

import AnimatedHeading from "../Common/AnimatedHeading";

const HAPPY_FAMILY_IMAGE = "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157405/happyFamily_uuyftj.png";

export default function DairyStandardsSection({ image }) {
    const displayImg = image || HAPPY_FAMILY_IMAGE;

    return (
        <section className="w-full py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Outer Container matching Screenshot 1 */}
            <div className="rounded-[36px] bg-[#EFF1F5] dark:bg-gray-900/90 border border-white/80 dark:border-gray-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.06)] p-4 sm:p-8 transition-colors duration-300">
                <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 sm:p-10 shadow-sm border border-white dark:border-gray-700 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    
                    {/* Left Image Container with Floating Pill Badge */}
                    <div className="relative rounded-[28px] overflow-hidden h-[340px] sm:h-[400px] bg-gray-100 dark:bg-gray-700 group shadow-sm">
                        <img
                            src={displayImg}
                            alt="MADHU Dairy Happy Family Quality Purity"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        
                        {/* Floating Pill Badge: [ ✦ Zero Chemical Preservatives ] */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0284C7] hover:bg-[#0369a1] text-white px-6 py-2.5 rounded-full shadow-[0_10px_25px_rgba(2,132,199,0.4)] flex items-center gap-2 text-xs sm:text-sm font-extrabold whitespace-nowrap border border-cyan-300/40"
                        >
                            <AutoAwesomeIcon sx={{ fontSize: "1rem" }} className="text-amber-300 animate-spin-slow" />
                            <span>Zero Chemical Preservatives</span>
                        </motion.div>
                    </div>

                    {/* Right Specifications & Features Content */}
                    <div className="space-y-6">
                        {/* Tagline */}
                        <div>
                            <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#0284C7] dark:text-[#6C5CE7]">
                                MADHU DAIRY STANDARDS
                            </span>
                            <AnimatedHeading
                                blackText="Secret Dairy Technologies &"
                                violetText="Quality Purity"
                                className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2D3748] dark:text-white leading-tight mt-1"
                            />
                        </div>

                        {/* 3 Checkmark Bullet Points */}
                        <div className="space-y-5">
                            {/* Point 1 */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-[#0284C7] border border-cyan-200 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckIcon sx={{ fontSize: "1rem" }} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#2D3748] dark:text-white">
                                        Traditional Recipe Taste
                                    </h3>
                                    <p className="text-xs text-[#718096] dark:text-gray-300 leading-relaxed mt-0.5">
                                        Carefully preserved fat & protein ratio maintaining natural rich cow milk flavor.
                                    </p>
                                </div>
                            </div>

                            {/* Point 2 */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-[#0284C7] border border-cyan-200 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckIcon sx={{ fontSize: "1rem" }} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#2D3748] dark:text-white">
                                        Cold-Chain Secret Filtration
                                    </h3>
                                    <p className="text-xs text-[#718096] dark:text-gray-300 leading-relaxed mt-0.5">
                                        Multi-stage microfiltration keeping standard bacterial count at zero without boiling off vitamins.
                                    </p>
                                </div>
                            </div>

                            {/* Point 3 */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-[#0284C7] border border-cyan-200 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckIcon sx={{ fontSize: "1rem" }} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#2D3748] dark:text-white">
                                        Long Shelf Life Freshness
                                    </h3>
                                    <p className="text-xs text-[#718096] dark:text-gray-300 leading-relaxed mt-0.5">
                                        Aseptic oxygen-barrier glass bottles keep milk fresh naturally for days.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button: [ Explore Full Range → ] */}
                        <div className="pt-2">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369a1] text-white px-7 py-3 rounded-full text-sm font-extrabold shadow-[0_10px_25px_rgba(2,132,199,0.3)] hover:scale-105 transition-all cursor-pointer"
                            >
                                <span>Explore Full Range</span>
                                <ArrowForwardIcon sx={{ fontSize: "1.1rem" }} />
                            </Link>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}
