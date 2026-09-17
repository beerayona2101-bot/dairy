import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Drawer from '@mui/material/Drawer';
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CategoryIcon from "@mui/icons-material/Category";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from "@mui/icons-material/Logout";

import PersonIcon from "@mui/icons-material/Person";

import { ThemeContext } from "../../context/ThemeProvider";
import { AdminAuthContext, UserAuthContext } from "../../context/AuthProvider";

import logoDarkMode from "../../assets/logoDarkMode.png";
import logoLightMode from "../../assets/logoLightMode.png";

import { SidebarContext } from "../../context/SidebarProvider";
import { AdminOrderContext } from "../../context/AdminOrderProvider";

import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {

    const location = useLocation();
    const navigate = useNavigate();

    const { isSidebarOpen, setIsSidebarOpen } = useContext(SidebarContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { handleAdminLogout } = useContext(AdminAuthContext);
    const { setOpenLoginDialog } = useContext(UserAuthContext);
    const { adminOrders } = useContext(AdminOrderContext);

    // Determine active group based on current route, default to "catalog" if none match
    const getActiveGroupFromPath = () => {
        if (location.pathname.startsWith("/admin/orders") || location.pathname.startsWith("/admin/revenue") || location.pathname.startsWith("/admin/customers")) {
            return "sales";
        }
        if (location.pathname.startsWith("/admin/page-content") || location.pathname.startsWith("/admin/reports")) {
            return "cms";
        }
        return "catalog";
    };

    const [expandedGroup, setExpandedGroup] = useState(getActiveGroupFromPath);

    const toggleGroup = (groupKey) => {
        setExpandedGroup((prev) => (prev === groupKey ? null : groupKey));
    };

    const navGroups = [
        {
            type: "single",
            label: "Dashboard",
            icon: <DashboardIcon sx={{ fontSize: "1.3rem" }} />,
            to: "/admin/dashboard",
        },
        {
            type: "group",
            key: "catalog",
            label: "Catalog & Products",
            icon: <CategoryIcon sx={{ fontSize: "1.3rem" }} />,
            items: [
                { label: "Categories", to: "/admin/categories" },
                { label: "Products", to: "/admin/products" },
                { label: "Inventory Overview", to: "/admin/inventory" },
            ],
        },
        {
            type: "group",
            key: "sales",
            label: "Sales & Orders",
            icon: <ReceiptLongIcon sx={{ fontSize: "1.3rem" }} />,
            badge: adminOrders?.length || 0,
            items: [
                { label: "Orders", to: "/admin/orders", orderCount: adminOrders?.length || 0 },
                { label: "Revenue", to: "/admin/revenue" },
                { label: "Manage Customers", to: "/admin/customers" },
            ],
        },
        {
            type: "group",
            key: "cms",
            label: "Content & Support",
            icon: <ViewCarouselIcon sx={{ fontSize: "1.3rem" }} />,
            items: [
                { label: "Customer Enquiries (SMTP)", to: "/admin/enquiries" },
                { label: "Page Content CMS", to: "/admin/page-content" },
                { label: "Reports", to: "/admin/reports" },
            ],
        },
        {
            type: "single",
            label: "Profile",
            icon: <PersonIcon sx={{ fontSize: "1.3rem" }} />,
            to: "/admin/profile",
        },
    ];

    const closeSidebar = () => {
        if (isSidebarOpen) setIsSidebarOpen(false);
    };

    const handleLogout = () => {
        handleAdminLogout();
        closeSidebar();
        setOpenLoginDialog(true);
        navigate("/login", { replace: true });
    };

    const renderSidebarContent = () => (
        <div className="h-full w-64 flex flex-col justify-between bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px]">
            {/* Header / Logo */}
            <div className="sticky top-0 left-0 h-16 shrink-0 px-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700/60 z-10 box-border">
                <Link to="/home" onClick={closeSidebar} className="flex items-center hover:scale-105 transition-transform">
                    <img
                        src={theme === "dark" ? logoDarkMode : logoLightMode}
                        alt="MADHU Admin Logo"
                        loading="eager"
                        decoding="sync"
                        className="h-8 w-auto object-contain"
                    />
                </Link>
                <button
                    onClick={closeSidebar}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition cursor-pointer"
                    title="Close Sidebar"
                >
                    <CloseIcon fontSize="small" />
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
                {navGroups.map((group) => {
                    if (group.type === "single") {
                        const isActive = location.pathname === group.to;
                        return (
                            <Link
                                key={group.label}
                                to={group.to}
                                onClick={closeSidebar}
                                className={`flex items-center justify-between p-3 rounded-2xl transition-all font-extrabold text-xs ${
                                    isActive
                                        ? "bg-[#6C5CE7] text-white shadow-[0_8px_20px_rgba(108,92,231,0.3)]"
                                        : "text-[#718096] dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#6C5CE7]"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {group.icon}
                                    <span>{group.label}</span>
                                </div>
                            </Link>
                        );
                    }

                    const isGroupActive = group.items.some(
                        (sub) => location.pathname === sub.to || (sub.to !== "/admin/dashboard" && location.pathname.startsWith(sub.to))
                    );
                    const isExpanded = expandedGroup === group.key;

                    return (
                        <div key={group.key} className="rounded-2xl border border-white/80 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-xs">
                            {/* Accordion Group Header (Icons ONLY on Main Headings) */}
                            <button
                                onClick={() => toggleGroup(group.key)}
                                className={`w-full flex items-center justify-between p-3 text-xs uppercase tracking-wider font-black transition-colors cursor-pointer ${
                                    isGroupActive
                                        ? "text-[#6C5CE7] bg-purple-50/80 dark:bg-purple-950/40"
                                        : "text-[#718096] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {group.icon}
                                    <span>{group.label}</span>
                                    {group.badge > 0 && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-[#6C5CE7] text-white rounded-full font-extrabold shadow-xs">
                                            {group.badge}
                                        </span>
                                    )}
                                </div>
                                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ExpandMoreIcon sx={{ fontSize: "1.1rem" }} />
                                </motion.div>
                            </button>

                            {/* Accordion Group Items (NO ICONS for Child Items) */}
                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-1.5 pl-6 space-y-1">
                                            {group.items.map((subItem) => {
                                                const isSubActive = location.pathname === subItem.to || location.pathname.startsWith(subItem.to);
                                                return (
                                                    <Link
                                                        key={subItem.label}
                                                        to={subItem.to}
                                                        onClick={closeSidebar}
                                                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                                            isSubActive
                                                                ? "bg-[#6C5CE7] text-white shadow-xs font-black"
                                                                : "text-[#718096] dark:text-gray-300 hover:text-[#6C5CE7] hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                                        }`}
                                                    >
                                                        <span>{subItem.label}</span>
                                                        {subItem?.orderCount > 0 && (
                                                            <span className="text-[10px] bg-[#6C5CE7] px-2 py-0.5 rounded-full text-white font-bold">
                                                                {subItem.orderCount}
                                                            </span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            {/* Footer / Theme & Logout */}
            <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700/60 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-extrabold text-[#718096] dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                    title="Toggle Light/Dark Theme"
                >
                    <div className="flex items-center gap-3">
                        {theme === "light" ? <DarkModeIcon sx={{ fontSize: "1.2rem" }} /> : <LightModeIcon sx={{ fontSize: "1.2rem" }} />}
                        <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
                        {theme === "light" ? "OFF" : "ON"}
                    </span>
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition cursor-pointer"
                >
                    <div className="flex items-center gap-2.5">
                        <LogoutIcon sx={{ fontSize: "1.1rem" }} />
                        <span>Logout</span>
                    </div>
                </button>
            </div>
        </div>
    );

    return (
        <Drawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
            <div className={`h-screen overflow-auto transition-colors duration-300 ${
                theme === "light"
                    ? "bg-white text-[#1E293B]"
                    : "bg-[#0F172A] text-white"
            }`}>
                {renderSidebarContent()}
            </div>
        </Drawer>
    );
}
