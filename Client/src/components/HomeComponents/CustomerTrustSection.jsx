import { useContext } from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, CheckCircle2, Users, ThumbsUp } from "lucide-react";
import AnimatedHeading from "../Common/AnimatedHeading";
import { PageContentContext } from "../../context/PageContentProvider";

const ICON_MAP = {
    Star,
    ShieldCheck,
    Users,
    ThumbsUp,
    CheckCircle2,
};

const DEFAULT_METRICS = [
    { value: "4.9 / 5.0", label: "Average Customer Rating", iconName: "Star", color: "text-amber-400" },
    { value: "50,000+", label: "Happy Families Served", iconName: "Users", color: "text-[#0756B5] dark:text-blue-400" },
    { value: "100+", label: "Daily Quality Checks", iconName: "ShieldCheck", color: "text-emerald-500" },
    { value: "99.8%", label: "On-Time Morning Deliveries", iconName: "ThumbsUp", color: "text-[#00ACC1]" },
];

const DEFAULT_REVIEWS = [
    {
        name: "Sunita Deshmukh",
        location: "Ambad, Nashik",
        verified: true,
        rating: 5,
        title: "Pure taste with a thick malai layer",
        comment:
            "The natural sweetness and thick malai layer on this milk reminds me of our family farm. The paneer is so fresh that it stays soft without boiling. Truly dependable quality.",
        product: "Natural Cow Milk & Malai Paneer",
        avatar: "",
    },
    {
        name: "Rajesh Kulkarni",
        location: "Nashik City",
        verified: true,
        rating: 5,
        title: "Punctual delivery before 6:30 AM",
        comment:
            "Subscribed for 9 months now. The delivery person quietly places the chilled bottles at our doorstep before 6:30 AM without fail. The aroma of their desi ghee is exceptional.",
        product: "Pure Desi Ghee & Fresh Milk",
        avatar: "",
    },
    {
        name: "Dr. Ananya Patil",
        location: "Gangapur Road, Nashik",
        verified: true,
        rating: 5,
        title: "Complete peace of mind for my children",
        comment:
            "As a doctor and mother, finding unadulterated milk free of synthetic hormones was essential. The transparency and strict 4°C processing make Natural Milk Dairy our #1 choice.",
        product: "A2 Buffalo Milk & Thick Curd",
        avatar: "",
    },
];

const DEFAULT_CERTIFICATIONS = [
    "FSSAI Certified Processing Facility",
    "Zero Chemical Adulteration Guarantee",
    "Grass-Fed & Hormone-Free Herd",
    "Food-Grade Tamper-Evident Packaging",
];

export default function CustomerTrustSection() {
    const { pageContent } = useContext(PageContentContext);
    const ct = pageContent?.customerTrust || {};

    const titlePrefix = ct.titlePrefix || "Loved by Over";
    const familiesCount = ct.familiesCount || "50,000+ Families";
    const subtitle = ct.subtitle || "Pure freshness and dependable service that thousands of homes wake up to every single day.";

    const metrics = (ct.metrics && ct.metrics.length > 0)
        ? ct.metrics
        : DEFAULT_METRICS;

    const reviews = (ct.reviews && ct.reviews.length > 0)
        ? ct.reviews
        : DEFAULT_REVIEWS;

    const certifications = (ct.certifications && ct.certifications.length > 0)
        ? ct.certifications
        : DEFAULT_CERTIFICATIONS;

    return (
        <section aria-label="Customer Trust & Reviews" className="w-full space-y-6">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
                <AnimatedHeading
                    blackText={titlePrefix}
                    violetText={familiesCount}
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-center"
                    violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                />

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {subtitle}
                </p>
            </div>

            {/* Metrics Highlight Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {metrics.map((metric, idx) => {
                    const Icon = ICON_MAP[metric.iconName] || Star;
                    const colorClass = metric.color?.startsWith("#") ? "" : metric.color;
                    const colorStyle = metric.color?.startsWith("#") ? { color: metric.color } : {};

                    return (
                        <div
                            key={`metric-${idx}`}
                            className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center text-center space-y-1"
                        >
                            <Icon
                                className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${colorClass}`}
                                style={colorStyle}
                            />
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {metric.value}
                            </span>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight">
                                {metric.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Customer Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                {reviews.map((review, idx) => (
                    <motion.div
                        key={`review-${idx}`}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-between space-y-4"
                    >
                        <div className="space-y-2.5">
                            {/* Star Rating */}
                            <div className="flex items-center gap-1">
                                {[...Array(Math.min(5, Math.max(1, review.rating || 5)))].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                "{review.title}"
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                {review.comment}
                            </p>
                        </div>

                        {/* Customer Info & Avatar & Verified Badge */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                {review.avatar ? (
                                    <img
                                        src={review.avatar}
                                        alt={review.name}
                                        className="w-8 h-8 rounded-full object-cover border border-blue-200 dark:border-slate-700 shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0756B5] dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                                        {review.name ? review.name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                        {review.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                                        {review.location}
                                    </p>
                                </div>
                            </div>

                            {review.verified && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Verified</span>
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Certifications Bar */}
            <div className="rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center sm:text-left">
                    {certifications.map((cert, idx) => (
                        <div key={`cert-${idx}`} className="flex items-center gap-2 justify-center sm:justify-start">
                            <CheckCircle2 className="w-4 h-4 text-[#0756B5] dark:text-blue-400 shrink-0" />
                            <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                                {cert}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
