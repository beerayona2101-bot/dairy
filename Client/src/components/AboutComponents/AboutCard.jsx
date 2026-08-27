import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

export default function AboutCard({ title, description, image, reverse }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex flex-col md:flex-row items-center gap-8 lg:gap-12 my-10 p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/90 dark:border-gray-700/80 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(30,136,229,0.18)] hover:-translate-y-2 hover:border-blue-400/50 hover:bg-white/85 dark:hover:bg-gray-800/85 transition-all duration-200 ease-out cursor-pointer ${
                reverse ? "md:flex-row-reverse" : ""
            }`}
        >
            <div className="w-full md:w-1/2 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-xs">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-64 sm:h-80 md:h-96 object-cover"
                />
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full w-fit mb-3 border border-blue-100 dark:border-blue-900/40">
                    Madhur Dairy Standard
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug mb-4">
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm sm:text-base leading-relaxed">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}

AboutCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    reverse: PropTypes.bool,
};
