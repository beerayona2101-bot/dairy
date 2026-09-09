
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ThermostatAutoIcon from "@mui/icons-material/ThermostatAuto";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";

const productWorkflow = [
    {
        icon: <LocalDrinkIcon sx={{ fontSize: 50 }} />,
        title: "Milking Twice a Day",
        description:
            "We source milk from farmers on the outskirts of your city for complete freshness and purity.",
    },
    {
        icon: <ScienceOutlinedIcon sx={{ fontSize: 50 }} />,
        title: "100+ Tests Everyday",
        description:
            "We quality test all milk for adulteration every single day to ensure purity.",
    },
    {
        icon: <ThermostatAutoIcon sx={{ fontSize: 50 }} />,
        title: "Pasteurization & Packing at 4°C",
        description:
            "Maintaining milk at 4°C improves its shelf life and prevents harmful bacteria growth.",
    },
    {
        icon: <DeliveryDiningIcon sx={{ fontSize: 50 }} />,
        title: "Assured 7 AM Doorstep Delivery",
        description:
            "Fresh milk & best quality groceries delivered to your doorstep every morning.",
    },
];

export default function ProductProcess() {
    return (
        <section className="mb-16 px-3 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/90 dark:border-gray-700/80 shadow-md p-8 sm:p-12 rounded-3xl"
            >
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40">
                        Our Farm-to-Table Promise
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-3 mb-3">
                        Bringing Natural Freshness Back to Your Kitchen
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        Better everyday health begins with the basics. We ensure everything in
                        your kitchen is thoroughly tested for purity, taste, and safety.
                    </p>
                </motion.div>

                <motion.div
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                        hidden: {},
                        show: {
                            transition: {
                                staggerChildren: 0.15,
                            },
                        },
                    }}
                >
                    {productWorkflow.map(({ icon, title, description }, i) => (
                        <motion.div
                            key={i}
                            className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50/80 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600/50 hover:-translate-y-1 transition-all duration-300 shadow-xs"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                            }}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-100/80 dark:bg-blue-900/40 text-[#1E88E5] dark:text-blue-400 flex items-center justify-center mb-4 shadow-xs">
                                {icon}
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E88E5] dark:text-blue-400 mb-1">
                                Step 0{i + 1}
                            </span>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
}
