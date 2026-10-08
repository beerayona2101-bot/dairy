import { motion } from "framer-motion";
import { Droplets, Heart, ShieldCheck, Layers, BadgePercent, Truck } from "lucide-react";
import AnimatedHeading from "../Common/AnimatedHeading";

const BENEFITS = [
    {
        icon: Droplets,
        title: "Fresh & Natural Dairy",
        description: "Delivered straight from local partner farms to your doorstep — untouched, pure, and 100% preservative-free.",
        color: "#0756B5",
        bgClass: "bg-blue-50 dark:bg-blue-950/40 text-[#0756B5] dark:text-blue-400 border-blue-200/60 dark:border-blue-900/40",
    },
    {
        icon: Heart,
        title: "Ethically Sourced Milk",
        description: "Our dairy farmers practice humane animal care, nourishing cows with clean water and pesticide-free green fodder.",
        color: "#E11D48",
        bgClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40",
    },
    {
        icon: ShieldCheck,
        title: "4°C Hygienic Processing",
        description: "Strict cold-chain pasteurization and food-grade packaging preserve natural vitamins without chemical additives.",
        color: "#075C2A",
        bgClass: "bg-emerald-50 dark:bg-emerald-950/40 text-[#075C2A] dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40",
    },
    {
        icon: Layers,
        title: "Comprehensive Dairy Range",
        description: "From morning cow & buffalo milk to thick probiotic curd, malai paneer, aromatic bilona ghee, and traditional sweets.",
        color: "#7C3AED",
        bgClass: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-900/40",
    },
    {
        icon: BadgePercent,
        title: "Fair & Honest Pricing",
        description: "Direct farm-to-family model removes middleman margins, guaranteeing fair rates for farmers and great value for you.",
        color: "#D97706",
        bgClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40",
    },
    {
        icon: Truck,
        title: "Punctual 7 AM Delivery",
        description: "Chilled morning delivery right at your door 365 days a year, ensuring breakfast is always fresh and never delayed.",
        color: "#0284C7",
        bgClass: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-900/40",
    },
];

export default function WhyChooseUsSection() {
    return (
        <section id="why-choose-us" aria-label="Why Choose Natural Milk Dairy" className="w-full space-y-6">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
                <AnimatedHeading
                    blackText="Why Choose"
                    violetText="Natural Milk Dairy"
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-center"
                    violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                />

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    We uphold strict quality, ethical animal care, and uncompromising hygiene at every single step.
                </p>
            </div>

            {/* 6 Benefits Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {BENEFITS.map((b, idx) => {
                    const Icon = b.icon;
                    return (
                        <motion.div
                            key={b.title}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: idx * 0.06 }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-between group transition-all"
                        >
                            <div className="space-y-3">
                                <div
                                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 ${b.bgClass} group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        {b.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                        {b.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
