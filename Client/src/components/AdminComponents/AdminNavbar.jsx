import React, { useContext, useEffect, useRef, useState } from "react";
import { SidebarContext } from "../../context/SidebarProvider";
import { AdminAuthContext } from "../../context/AuthProvider";
import { formatDistanceToNow } from "date-fns";

import MenuIcon from "@mui/icons-material/Menu";
import { Avatar, Dialog, Slide, Tooltip } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { Bell, X } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { removeAdminNotification } from "../../services/adminService";
import { removeUserNotification } from "../../services/userProfileService";
import { ThemeContext } from "../../context/ThemeProvider";
import { AdminOrderContext } from "../../context/AdminOrderProvider";
import { UserAuthContext } from "../../context/AuthProvider";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function AdminNavbar() {

    const location = useLocation();
    const { theme, toggleTheme } = useContext(ThemeContext);

    const { authAdmin, setAuthAdmin, authAdminLoading } = useContext(AdminAuthContext);
    const { authUser, setAuthUser } = useContext(UserAuthContext);
    const { setIsSidebarOpen, isSidebarCollapsed, toggleSidebarCollapse } = useContext(SidebarContext);
    const { notification, setNotification } = useContext(AdminOrderContext)
    const [notificationDialog, setNotificationDialog] = useState(false);
    const [notificationLoadingIndex, setNotificationLoadingIndex] = useState(null);
    const [animate, setAnimate] = useState(false);

    const prevCountRef = useRef(notification.length);

    const loginAdmin = localStorage.getItem("Admin");

    // Sidebar toggle handler: toggle drawer on both desktop and mobile
    const handleSidebarToggle = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        if (notification.length > prevCountRef.current) {
            setAnimate(true);
            setTimeout(() => setAnimate(false), 2600);
        }
        prevCountRef.current = notification.length;
    }, [notification.length]);

    const handleRemoveNotification = async (index, mode) => {
        const adminId = authAdmin?._id;
        const userId = authUser?._id;

        if (!adminId && !userId) {
            enqueueSnackbar("Please login to manage notifications.", { variant: "warning" });
            return;
        }

        if (mode === "all") {
            setNotificationLoadingIndex("all");
        } else {
            setNotificationLoadingIndex(index);
        }

        try {
            let res;
            if (adminId) {
                res = await removeAdminNotification(adminId, mode, index);
            } else {
                res = await removeUserNotification(userId, mode, index);
            }

            if (res?.success) {
                if (mode === "all") {
                    setNotification([]);
                    if (setAuthAdmin) setAuthAdmin((prev) => prev ? { ...prev, notifications: [] } : null);
                    if (setAuthUser) setAuthUser((prev) => prev ? { ...prev, notifications: [] } : null);
                } else if (mode === "index") {
                    setNotification((prev) => prev.filter((_, i) => i !== index));
                    if (setAuthAdmin) setAuthAdmin((prev) => prev ? { ...prev, notifications: (prev.notifications || []).filter((_, i) => i !== index) } : null);
                    if (setAuthUser) setAuthUser((prev) => prev ? { ...prev, notifications: (prev.notifications || []).filter((_, i) => i !== index) } : null);
                }
            } else {
                enqueueSnackbar(res?.message || "Failed to remove notification.", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Server error while removing notification.", { variant: "error" });
        } finally {
            setNotificationLoadingIndex(null);
        }
    };

    const adminNavLinks = [
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Products", path: "/admin/products" },
        { label: "Orders", path: "/admin/orders" },
        { label: "Customers", path: "/admin/customers" },
        { label: "Enquiries", path: "/admin/enquiries" },
        { label: "Reports", path: "/admin/reports" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full py-3 px-3 sm:px-6 lg:px-8 transition-all duration-300 bg-[#EFF1F5]/80 dark:bg-gray-900/80 backdrop-blur-md">
            {/* Single Floating White Capsule Pill Container matching customer Navbar */}
            <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800/95 rounded-full px-4 sm:px-6 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-white/80 dark:border-gray-700 flex items-center justify-between transition-all duration-300">
                
                {/* Left Side: Sidebar Toggle Menu */}
                <div className="flex items-center gap-3">
                    <button
                        className="w-9 h-9 rounded-full bg-purple-50 dark:bg-gray-700 text-[#6C5CE7] dark:text-purple-300 flex items-center justify-center hover:scale-105 transition cursor-pointer border border-purple-100 dark:border-gray-600"
                        onClick={handleSidebarToggle}
                        title="Toggle Sidebar Menu"
                    >
                        <MenuIcon sx={{ fontSize: "1.2rem" }} />
                    </button>
                </div>

                {/* Right Action Icons: Notification Bell & Admin Avatar Badge */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <Tooltip title="Notifications">
                        <button
                            onClick={() => setNotificationDialog(true)}
                            className="w-9 h-9 rounded-full hover:bg-purple-50/60 dark:hover:bg-gray-700 flex items-center justify-center transition cursor-pointer relative text-gray-700 dark:text-gray-200"
                        >
                            <Bell className="w-4.5 h-4.5" />
                            {(notification?.length > 0 && loginAdmin) && (
                                <span
                                    className={`absolute -top-1 -right-1 font-bold px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] ${animate ? "animate-bounce" : ""}`}
                                >
                                    {notification?.length}
                                </span>
                            )}
                        </button>
                    </Tooltip>

                    {/* Admin Avatar Pill Badge */}
                    <Link to="/admin/profile" className="flex items-center gap-2 bg-purple-50 dark:bg-gray-700 px-3 py-1 rounded-full border border-purple-100 dark:border-gray-600 hover:scale-102 transition">
                        {authAdminLoading ? (
                            <div className="h-7 w-7 rounded-full bg-gray-300 animate-pulse" />
                        ) : (
                            <Avatar src={authAdmin?.image} alt={authAdmin?.name} sx={{ width: 28, height: 28 }} />
                        )}
                        <span className="text-xs font-black text-[#0F2742] dark:text-white hidden sm:inline">
                            {authAdmin?.name || "Admin"}
                        </span>
                    </Link>
                </div>
            </div>


            <Dialog
                open={notificationDialog}
                onClose={() => setNotificationDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                slots={{
                    transition: Transition,
                }}
                PaperProps={{
                    sx: {
                        position: 'absolute',
                        top: 75,
                        right: 10,
                        m: 0,
                        width: '350px',
                        maxHeight: "300px",
                        backgroundColor: theme === "dark" ? "#0f0f0f" : "#ffffff",
                    },
                }}
                fullWidth
            >
                <div className="text-black dark:text-white">
                    <div className="sticky top-0 z-10 backdrop-blur bg-white/30 dark:bg-[#2f2f2f]/30 px-3 py-2 flex items-center justify-between rounded-t">
                        <h2 className="text-lg font-semibold">Notifications</h2>
                        {notification.length > 0 && (
                            <button
                                disabled={notificationLoadingIndex}
                                onClick={() => handleRemoveNotification(-1, "all")}
                                className="text-xs text-red-500 hover:underline disabled:cursor-not-allowed"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {notification.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-6 px-3">
                            🎉 You're all caught up! No new notifications.
                        </div>
                    ) : (
                        <ul className="space-y-3 px-3 py-3">
                            {notification.map((item, idx) => (
                                <li
                                    key={item?._id || item?.id || `admin-notif-${idx}-${item?.title || ""}`}
                                    className="bg-gray-100 dark:bg-gray-500/20 p-3 rounded-md shadow-sm relative"
                                >

                                    <div className='flex justify-between items-center'>
                                        <p className="font-medium text-sm pr-5">{item?.title}</p>

                                        <button
                                            disabled={notificationLoadingIndex !== null}
                                            onClick={() => handleRemoveNotification(idx, "index")}
                                            className="text-gray-400 hover:text-red-500 text-sm disabled:cursor-not-allowed"
                                            title="Clear"
                                        >
                                            {notificationLoadingIndex === idx ? (
                                                <div className="w-3 h-3 border-[2px] border-t-transparent border-gray-500 rounded-full animate-spin" />
                                            ) : (
                                                <X size={14} />
                                            )}
                                        </button>

                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                        {item?.description}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-right">
                                        {formatDistanceToNow(new Date(item?.date), { addSuffix: true })}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Dialog>
        </nav>
    );
}
