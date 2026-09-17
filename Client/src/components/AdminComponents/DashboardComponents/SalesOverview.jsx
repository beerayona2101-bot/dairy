import { motion } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PercentIcon from "@mui/icons-material/Percent";
import BarChartIcon from "@mui/icons-material/BarChart";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import ListAltIcon from '@mui/icons-material/ListAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { formatNumberWithCommas } from "../../../utils/format";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// Animation variants
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: "easeOut",
        },
    },
};

export default function SalesOverview({ totalRevenue, totalSales, totalProfit, totalExpenses, loading }) {
    const navigate = useNavigate();

    const salesData = [
        {
            name: "Revenue",
            value: totalRevenue,
            trend: "+14.2%",
            trendUp: true,
            icon: <TrendingUpIcon className="text-[#6C5CE7]" sx={{ fontSize: "1.3rem" }} />,
            bg: "bg-purple-50/90 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/40",
            iconBg: "bg-purple-100 dark:bg-purple-900/60",
            textColor: "text-[#6C5CE7] dark:text-purple-300",
            route: "/admin/orders",
        },
        {
            name: "Sales",
            value: totalSales,
            trend: "+18.5%",
            trendUp: true,
            icon: <PercentIcon className="text-purple-600" sx={{ fontSize: "1.3rem" }} />,
            bg: "bg-purple-50/90 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/40",
            iconBg: "bg-purple-100 dark:bg-purple-900/60",
            textColor: "text-purple-600 dark:text-purple-300",
            route: "/admin/orders",
        },
        {
            name: "Profit",
            value: totalProfit,
            trend: "+9.4%",
            trendUp: true,
            icon: <BarChartIcon className="text-purple-500" sx={{ fontSize: "1.3rem" }} />,
            bg: "bg-purple-50/90 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/40",
            iconBg: "bg-purple-100 dark:bg-purple-900/60",
            textColor: "text-purple-500 dark:text-purple-300",
            route: "/admin/orders",
        },
        {
            name: "Cost",
            value: totalRevenue - totalProfit,
            trend: "-2.1%",
            trendUp: false,
            icon: <MoneyOffIcon className="text-purple-700 dark:text-purple-300" sx={{ fontSize: "1.3rem" }} />,
            bg: "bg-purple-50/90 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/40",
            iconBg: "bg-purple-100 dark:bg-purple-900/60",
            textColor: "text-purple-700 dark:text-purple-300",
            route: "/admin/inventory",
        },
        {
            name: "Expenses",
            value: totalExpenses,
            trend: "-0.8%",
            trendUp: false,
            icon: <ListAltIcon className="text-zinc-900 dark:text-gray-200" sx={{ fontSize: "1.3rem" }} />,
            bg: "bg-zinc-100/90 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/40",
            iconBg: "bg-zinc-200/80 dark:bg-zinc-800/80",
            textColor: "text-zinc-900 dark:text-white",
            route: "/admin/orders",
        },
    ];

    return (
        <motion.div
            className="bg-white dark:bg-gray-800/80 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/80"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Sales & Revenue Metrics</h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Live Performance
                </span>
            </div>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                variants={containerVariants}
            >
                {loading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-700/50 animate-pulse h-28"
                        />
                    ))
                    : salesData.map((item, index) => (
                        <motion.button
                            key={item.name || index}
                            type="button"
                            onClick={() => navigate(item.route)}
                            variants={cardVariants}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-2xl border ${item.bg} cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md text-left flex flex-col justify-between group`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                                    item.trendUp
                                        ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border border-purple-300"
                                        : "bg-zinc-900 text-white dark:bg-zinc-800 dark:text-gray-200 border border-zinc-700"
                                }`}>
                                    {item.trendUp ? `↗ ${item.trend}` : `↘ ${item.trend}`}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                                    {item.name}
                                </p>
                                <div className="flex items-center justify-between mt-0.5">
                                    <h3 className={`text-xl font-black ${item.textColor}`}>
                                        &#8377;{formatNumberWithCommas(item.value)}
                                    </h3>
                                    <ArrowForwardIcon className="text-gray-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 !text-sm" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
            </motion.div>
        </motion.div>
    );
}

SalesOverview.propTypes = {
    totalRevenue: PropTypes.number.isRequired,
    totalSales: PropTypes.number.isRequired,
    totalProfit: PropTypes.number.isRequired,
    totalExpenses: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired
};
