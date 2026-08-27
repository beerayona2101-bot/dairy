import PropTypes from "prop-types";
import EastIcon from '@mui/icons-material/East';
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function OfferingCard({ image, title, description }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="overflow-hidden transition duration-300"
        >
            <div className="w-full h-56 rounded-xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800">
                <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
            </div>
            <div className="p-4 text-center">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-2">
                    {description}
                </p>

                <Link
                    to="/products"
                    className="gap-2 text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center"
                >
                    Shop <EastIcon sx={{ fontSize: "1.1rem" }} />
                </Link>
            </div>
        </motion.div>
    );
}

OfferingCard.propTypes = {
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};
