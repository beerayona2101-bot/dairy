import { motion } from "framer-motion";
import AnimatedHeading from "../Common/AnimatedHeading";
import step1Img from "../../assets/freshMilk.jpg";
import step2Img from "../../assets/hygienicProcessing.jpg";
import step3Img from "../../assets/productImage.jpg";
import step4Img from "../../assets/deliveryTruck.jpg";

const JOURNEY_STEPS = [
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
    return (
        <section aria-label="Farm to Table Freshness Journey" className="w-full space-y-6">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
                <AnimatedHeading
                    blackText="Farm to Table,"
                    violetText="Within Hours"
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-center"
                    violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                />

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Follow how pure milk travels from green village pastures to your morning table.
                </p>
            </div>

            {/* 4 Connected Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative">
                {JOURNEY_STEPS.map((s, idx) => (
                    <motion.div
                        key={s.step}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                        className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col group transition-all"
                    >
                        {/* Step Image */}
                        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                            <img
                                src={s.image}
                                alt={s.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {s.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                {s.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
