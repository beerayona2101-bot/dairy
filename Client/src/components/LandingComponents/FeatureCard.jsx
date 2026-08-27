import PropTypes from "prop-types";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function FeatureCard({ image, title, description }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="items-center bg-white dark:bg-[#2b2b2b] shadow-md rounded-xl overflow-hidden transition-colors duration-300 p-3"
        >
            <div className="w-full h-auto flex items-center gap-3">
                <img
                    src={image}
                    alt={title}
                    className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                    loading="lazy"
                />
                <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100 px-3">
                    {title}
                </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm pt-3">
                {description}
            </p>
        </motion.div>
    )
}

FeatureCard.propTypes = {
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
}