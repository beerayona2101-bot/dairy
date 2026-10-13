import React, { useState, useMemo, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    X, 
    ChevronDown, 
    HelpCircle, 
    ShieldCheck, 
    Truck, 
    Calendar, 
    PhoneCall, 
    MessageCircle,
    ArrowRight,
    Sparkles
} from "lucide-react";
import BackButton from "../components/Common/BackButton";
import AnimatedHeading from "../components/Common/AnimatedHeading";
import { PageContentContext } from "../context/PageContentProvider";
import { faqs as defaultFaqs } from "../data/products";
import company from "../data/company.json";

// Categories metadata
const FAQ_CATEGORIES = [
    { id: "all", label: "All Questions", icon: Sparkles },
    { id: "quality", label: "Purity & Quality", icon: ShieldCheck },
    { id: "delivery", label: "Delivery & Timings", icon: Truck },
    { id: "subscription", label: "Subscriptions", icon: Calendar },
    { id: "support", label: "Support & Orders", icon: HelpCircle },
];

// Helper to categorize dynamic or default questions
function categorizeFaq(questionText) {
    const q = (questionText || "").toLowerCase();
    if (q.includes("deliver") || q.includes("timing") || q.includes("morning") || q.includes("location") || q.includes("area")) {
        return "delivery";
    }
    if (q.includes("subscri") || q.includes("daily") || q.includes("pause") || q.includes("plan") || q.includes("routine")) {
        return "subscription";
    }
    if (q.includes("quality") || q.includes("pure") || q.includes("organic") || q.includes("a2") || q.includes("cow") || q.includes("test") || q.includes("pasteur")) {
        return "quality";
    }
    return "support";
}

function FaqAccordionItem({ faq, index, isOpen, onToggle }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className={`rounded-2xl transition-all duration-300 border ${
                isOpen
                    ? "bg-white dark:bg-slate-800/95 border-[#0756B5]/40 dark:border-blue-500/40 shadow-lg shadow-blue-500/5 ring-1 ring-[#0756B5]/15"
                    : "bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
            }`}
        >
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-start sm:items-center justify-between p-4 sm:p-5 text-left cursor-pointer group"
                aria-expanded={isOpen}
            >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 pr-3">
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0 flex items-center justify-center font-black text-xs transition-colors duration-200 ${
                        isOpen
                            ? "bg-[#0756B5] text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-[#0756B5]"
                    }`}>
                        {index + 1}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-[#0756B5] dark:group-hover:text-blue-400 transition-colors">
                        {faq.question}
                    </span>
                </div>

                <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                            ? "bg-[#0756B5] text-white rotate-180"
                            : "bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-300 group-hover:bg-blue-100 group-hover:text-[#0756B5]"
                    }`}
                >
                    <ChevronDown className="w-4 h-4" />
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="pt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {faq.answer}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FaqPage() {
    const { pageContent } = useContext(PageContentContext) || {};
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [openIndex, setOpenIndex] = useState(0);

    // Set page title for SEO
    useEffect(() => {
        document.title = "Frequently Asked Questions | Natural Milk Dairy";
    }, []);

    // Merge dynamic and fallback FAQs
    const allFaqs = useMemo(() => {
        const source = pageContent?.faqs?.length > 0 ? pageContent.faqs : defaultFaqs;
        return source.map((f, i) => ({
            ...f,
            category: f.category || categorizeFaq(f.question),
            originalIndex: i,
        }));
    }, [pageContent]);

    // Filter FAQs by search query and category
    const filteredFaqs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return allFaqs.filter((faq) => {
            const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
            const matchesQuery = !query || 
                (faq.question && faq.question.toLowerCase().includes(query)) ||
                (faq.answer && faq.answer.toLowerCase().includes(query));
            return matchesCategory && matchesQuery;
        });
    }, [allFaqs, selectedCategory, searchQuery]);

    const handleToggle = (idx) => {
        setOpenIndex((prev) => (prev === idx ? -1 : idx));
    };

    return (
        <div className="min-h-screen bg-[#FAFBFD] dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
            {/* Header Hero Section */}
            <div className="relative overflow-hidden pt-2 sm:pt-6 pb-6 sm:pb-10 px-3 sm:px-6 lg:px-8 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                {/* Glow backdrop decorations */}
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/15 blur-3xl rounded-full pointer-events-none -z-10" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-600/15 blur-3xl rounded-full pointer-events-none -z-10" />

                <div className="max-w-4xl mx-auto">
                    {/* Mobile Back Button (Top Left on Mobile) */}
                    <div className="md:hidden flex items-center justify-start mb-2">
                        <BackButton fallbackPath="/home" />
                    </div>

                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 shadow-2xs">
                            <HelpCircle className="w-3.5 h-3.5 text-[#0756B5] dark:text-blue-400" />
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0756B5] dark:text-blue-400">
                                Help & Support Center
                            </span>
                        </div>

                        <AnimatedHeading
                            blackText="Frequently Asked"
                            violetText="Questions"
                            className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-center"
                            violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                        />

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
                            Have questions about our pure farm-fresh dairy, daily morning delivery schedules, quality testing, or subscription pausing? Find answers below.
                        </p>

                        {/* Interactive Search Bar */}
                        <div className="pt-2 max-w-xl mx-auto">
                            <div className="relative flex items-center">
                                <Search className="absolute left-4 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search questions (e.g. delivery, organic, testing)..."
                                    className="w-full pl-11 pr-10 py-3 sm:py-3.5 text-xs sm:text-sm rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#0756B5] dark:focus:border-blue-400 focus:outline-hidden shadow-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3.5 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="pt-2 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                            {FAQ_CATEGORIES.map((cat) => {
                                const IconComponent = cat.icon;
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                                            isSelected
                                                ? "bg-[#0756B5] text-white shadow-xs scale-102"
                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        }`}
                                    >
                                        <IconComponent className="w-3.5 h-3.5" />
                                        <span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main FAQs Accordion Section */}
            <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                    <span>
                        Showing <strong className="text-slate-900 dark:text-white">{filteredFaqs.length}</strong> questions
                        {searchQuery && ` for "${searchQuery}"`}
                    </span>
                    {filteredFaqs.length > 0 && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setOpenIndex(0)}
                                className="font-semibold text-[#0756B5] dark:text-blue-400 hover:underline cursor-pointer"
                            >
                                Reset View
                            </button>
                        </div>
                    )}
                </div>

                {/* FAQ List */}
                {filteredFaqs.length > 0 ? (
                    <div className="space-y-3">
                        {filteredFaqs.map((faq, idx) => (
                            <FaqAccordionItem
                                key={`faq-${faq.question}-${idx}`}
                                faq={faq}
                                index={idx}
                                isOpen={openIndex === idx}
                                onToggle={() => handleToggle(idx)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0756B5] dark:text-blue-400 flex items-center justify-center mx-auto">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            No matching questions found
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            We couldn't find any questions matching your query. You can reach out directly to our customer support team.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("all");
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer transition"
                        >
                            Clear Search Filters
                        </button>
                    </div>
                )}

                {/* Still Have Questions CTA Card */}
                <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-transparent dark:from-blue-950/40 dark:via-emerald-950/30 dark:to-slate-800/60 border border-blue-200/70 dark:border-blue-900/50 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
                    <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#0756B5] dark:text-blue-400">
                            Still Have Questions?
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                            We're Here to Help Every Morning
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-md">
                            Can't find what you're looking for? Reach out to our 24/7 dairy specialists or visit our Contact & Support page.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center">
                        <Link
                            to="/contact-us"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0756B5] hover:bg-blue-700 text-white text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all no-underline"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Contact Support</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <a
                            href={`tel:${company?.phone || "+919876543210"}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-extrabold border border-slate-200 dark:border-slate-700 shadow-xs hover:scale-105 active:scale-95 transition-all no-underline"
                        >
                            <PhoneCall className="w-3.5 h-3.5 text-[#075C2A] dark:text-emerald-400" />
                            <span>Call Us</span>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
