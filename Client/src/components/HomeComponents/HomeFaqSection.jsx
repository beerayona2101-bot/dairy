import { useState } from "react";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedHeading from "../Common/AnimatedHeading";
import { faqs as defaultFaqs } from "../../data/products";

function FaqItem({ question, answer, isOpen, onToggle }) {
    return (
        <div className="border-b border-slate-200/80 dark:border-slate-800 last:border-b-0">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 sm:py-5 px-1 text-left cursor-pointer transition-colors group"
                aria-expanded={isOpen}
            >
                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 pr-4 leading-snug group-hover:text-[#0756B5] dark:group-hover:text-blue-400 transition-colors">
                    {question}
                </span>
                <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                            ? "bg-[#0756B5] text-white rotate-180"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
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
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 px-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

FaqItem.propTypes = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
};

export default function HomeFaqSection({ faqs = [] }) {
    const list = Array.isArray(faqs) && faqs.length > 0 ? faqs : defaultFaqs;
    const [openIndex, setOpenIndex] = useState(0); // Open first item by default

    const handleToggle = (idx) => {
        setOpenIndex((prev) => (prev === idx ? -1 : idx));
    };

    return (
        <section id="faq" aria-label="Frequently Asked Questions" className="w-full space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
                <AnimatedHeading
                    blackText="Frequently Asked"
                    violetText="Questions"
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-center"
                    violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                />

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Learn more about our farm-fresh dairy, daily quality testing, and morning deliveries.
                </p>
            </div>

            <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
                {list.slice(0, 6).map((faq, idx) => (
                    <FaqItem
                        key={`faq-${idx}`}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openIndex === idx}
                        onToggle={() => handleToggle(idx)}
                    />
                ))}
            </div>
        </section>
    );
}

HomeFaqSection.propTypes = {
    faqs: PropTypes.array,
};
