import { useState } from "react";
import PropTypes from "prop-types";

function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-3.5 px-4 text-left cursor-pointer"
            >
                <span className="text-sm font-semibold text-gray-800 pr-2 leading-snug">{question}</span>
                <span className="text-gray-400 text-lg shrink-0">{open ? "−" : "+"}</span>
            </button>
            {open && (
                <div className="px-4 pb-4">
                    <p className="text-[12px] text-gray-500 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
}
FaqItem.propTypes = { question: PropTypes.string, answer: PropTypes.string };

export default function MobileFaqSection({ faqs }) {
    if (!faqs || faqs.length === 0) return null;
    return (
        <section className="md:hidden w-full bg-white mt-3">
            <div className="px-4 pt-5 pb-2">
                <h2 className="text-sm font-bold text-gray-800">Frequently Asked</h2>
            </div>
            <div className="divide-y divide-gray-100">
                {faqs.slice(0, 6).map((faq, i) => (
                    <FaqItem key={i} question={faq.question} answer={faq.answer} />
                ))}
            </div>
        </section>
    );
}
MobileFaqSection.propTypes = { faqs: PropTypes.array };
