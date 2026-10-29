import { useContext } from "react";
import { motion } from "framer-motion";
import AnimatedHeading from "../Common/AnimatedHeading";
import { PageContentContext } from "../../context/PageContentProvider";
import step1Img from "../../assets/freshMilk.jpg";
import step2Img from "../../assets/hygienicProcessing.jpg";
import step3Img from "../../assets/productImage.jpg";
import step4Img from "../../assets/deliveryTruck.jpg";

const DEFAULT_STEPS = [
    {
        step: "01",
        title: "Ethical Milking at Sunrise",
        description: "Fresh milk sourced at dawn from healthy, grass-fed cows on certified partner farms.",
        image: step1Img,
        badge: "PASTURE TO PAIL",
    },
    {
        step: "02",
        title: "100+ Daily Lab Tests",
        description: "Strict testing for density, SNF, fat percentage, and zero chemical adulteration.",
        image: step2Img,
        badge: "SCIENTIFIC RIGOR",
    },
    {
        step: "03",
        title: "4°C Cold Processing",
        description: "Low-temperature pasteurization and airtight eco-packaging preserving natural goodness.",
        image: step3Img,
        badge: "HYGIENIC FRESHNESS",
    },
    {
        step: "04",
        title: "7 AM Doorstep Delivery",
        description: "Dispatched in refrigerated cold-chain vehicles directly to your kitchen before breakfast.",
        image: step4Img,
        badge: "AT YOUR DOOR",
    },
];

export default function FarmToTableSection() {
    const { pageContent } = useContext(PageContentContext);
    const ftt = pageContent?.farmToTable || {};

    const titleBlack = ftt.titleBlack || "Farm to Table,";
    const titleHighlight = ftt.titleHighlight || "Within Hours";
    const subtitle = ftt.subtitle || "Follow how pure milk travels from green village pastures to your morning table.";

    const steps = (ftt.steps && ftt.steps.length > 0)
        ? ftt.steps.map((s, idx) => ({
            step: s.step || `0${idx + 1}`,
            title: s.title || DEFAULT_STEPS[idx]?.title || "Fresh Dairy Journey",
            description: s.description || DEFAULT_STEPS[idx]?.description || "",
            badge: s.badge || DEFAULT_STEPS[idx]?.badge || "FARM FRESH",
            image: s.image || DEFAULT_STEPS[idx]?.image || step1Img,
        }))
        : DEFAULT_STEPS;

    return (
        <section aria-label="Farm to Table Freshness Journey" className="w-full space-y-6">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
                <AnimatedHeading
                    blackText={titleBlack}
                    violetText={titleHighlight}
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-center"
                    violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                />

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {subtitle}
                </p>
            </div>

            {/* 4 Connected Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative">
                {steps.map((s, idx) => (
                    <motion.div
                        key={s.step}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                        className="h-full"
                    >
                        <div
                            className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_35px_-8px_rgba(7,86,181,0.22)] dark:hover:shadow-[0_20px_35px_-8px_rgba(0,0,0,0.6)] hover:border-[#0756B5] dark:hover:border-blue-400 hover:scale-[1.03] hover:-translate-y-2 transform-gpu transition-all duration-200 ease-out flex flex-col group cursor-pointer h-full relative z-0 hover:z-20 will-change-transform"
                        >
                            {/* Step Image without inner zoom */}
                            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                <img
                                    src={s.image}
                                    alt={s.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                                {/* Step Number Tag */}
                                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700 text-[11px] font-black text-[#0756B5] dark:text-blue-400 shadow-xs">
                                    Step {s.step}
                                </div>

                                {/* Badge */}
                                <div className="absolute bottom-2.5 left-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-200 drop-shadow">
                                    {s.badge}
                                </div>
                            </div>

                            {/* Step Content */}
                            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
                                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-[#0756B5] dark:group-hover:text-blue-400 transition-colors">
                                    {s.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    {s.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
