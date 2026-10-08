import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import AnimatedHeading from "../Common/AnimatedHeading";
import dairyImg from "../../assets/dairyImage.png";

export default function AboutBrandPreview() {
    return (
        <section aria-label="About Our Dairy" className="w-full">
            <div className="rounded-3xl sm:rounded-[36px] bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    
                    {/* Left Column: Brand Story & Message */}
                    <div className="space-y-5 text-left">
                        <AnimatedHeading
                            blackText="Rooted in Purity,"
                            violetText="Crafted with Care"
                            align="left"
                            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-start"
                            violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                        />

                        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                            At Natural Milk Dairy, we partner directly with trusted local farmers to deliver untouched, unadulterated milk and handcrafted dairy straight to thousands of happy homes every morning by 7 AM.
                        </p>

                        {/* Bullet Highlights */}
                        <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Ethically sourced from grass-fed cows with humane care</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Over 100+ lab tests daily to guarantee zero adulterants</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Strict 4°C hygienic cold-chain without chemical preservatives</span>
                            </div>
                        </div>

                        {/* CTA Link to About Page */}
                        <div className="pt-2">
                            <Link
                                to="/about"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0756B5] hover:bg-[#054593] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                            >
                                <span>Learn More About Our Story</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Clean Dairy Brand Visual */}
                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden h-64 sm:h-80 md:h-[340px] w-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 shadow-sm group">
                        <img
                            src={dairyImg}
                            alt="Natural Milk Dairy farm fresh products"
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Floating bottom badge */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                            <span className="text-xs sm:text-sm font-black tracking-wide drop-shadow-md">
                                Sourced Fresh Daily
                            </span>
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-xs text-white shadow-xs">
                                ✓ 100% Certified Pure
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
