import { motion } from "framer-motion";
import { Droplets, ShieldCheck, Sparkles, Clock } from "lucide-react";

const HIGHLIGHTS = [
    {
        icon: Droplets,
        title: "Fresh & Pure",
        description: "100% unadulterated milk directly from healthy grass-fed cows.",
        color: "#0756B5",
        bgLight: "bg-blue-50 dark:bg-blue-950/40",
        borderLight: "border-blue-100 dark:border-blue-900/50",
    },
    {
        icon: ShieldCheck,
        title: "Quality Assured",
        description: "100+ daily lab safety tests checking density, fat, and zero contaminants.",
        color: "#075C2A",
        bgLight: "bg-emerald-50 dark:bg-emerald-950/40",
        borderLight: "border-emerald-100 dark:border-emerald-900/50",
    },
    {
        icon: Sparkles,
        title: "Naturally Good",
        description: "Zero synthetic hormones, chemical preservatives, or artificial additives.",
        color: "#D97706",
        bgLight: "bg-amber-50 dark:bg-amber-950/40",
        borderLight: "border-amber-100 dark:border-amber-900/50",
    },
    {
        icon: Clock,
        title: "Delivered by 7 AM",
        description: "Direct cold-chain doorstep delivery every morning before your tea.",
        color: "#00ACC1",
        bgLight: "bg-cyan-50 dark:bg-cyan-950/40",
        borderLight: "border-cyan-100 dark:border-cyan-900/50",
    },
];

export default function TrustHighlights() {
    return (
        <section aria-label="Brand Highlights" className="w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {HIGHLIGHTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                            className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col items-start justify-between group transition-all"
                        >
                            <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${item.bgLight} ${item.borderLight} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                                style={{ color: item.color }}
                            >
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
