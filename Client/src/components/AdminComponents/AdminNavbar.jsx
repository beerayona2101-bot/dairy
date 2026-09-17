import React, { useContext, useEffect, useRef, useState } from "react";
import { SidebarContext } from "../../context/SidebarProvider";
import { AdminAuthContext } from "../../context/AuthProvider";
import { formatDistanceToNow } from "date-fns";

import MenuIcon from "@mui/icons-material/Menu";
import { Dialog, Slide, Tooltip } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Bell, X, CheckCheck } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { removeAdminNotification } from "../../services/adminService";
import { removeUserNotification } from "../../services/userProfileService";
import { markNotificationAsRead } from "../../services/notificationService";
import { ThemeContext } from "../../context/ThemeProvider";
import { AdminOrderContext } from "../../context/AdminOrderProvider";
import { UserAuthContext } from "../../context/AuthProvider";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default function AdminNavbar() {

    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);

    const { authAdmin, setAuthAdmin } = useContext(AdminAuthContext);
    const { authUser, setAuthUser } = useContext(UserAuthContext);
    const { setIsSidebarOpen } = useContext(SidebarContext);
    const { notification, setNotification } = useContext(AdminOrderContext);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationLoadingIndex, setNotificationLoadingIndex] = useState(null);
    const [animate, setAnimate] = useState(false);
    const bellRef = useRef(null);
    const panelRef = useRef(null);

    const prevCountRef = useRef(notification.length);
    const unreadCount = notification.filter(n => !n?.isRead).length;

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

    // Close on outside click
    useEffect(() => {
        if (!notificationOpen) return;
        const handleOutside = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                bellRef.current && !bellRef.current.contains(e.target)
            ) {
                setNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [notificationOpen]);

    const handleRemoveNotification = async (index, mode) => {
        const adminId = authAdmin?._id;
        const userId = authUser?._id;

        if (!adminId && !userId) {
            enqueueSnackbar("Please login to manage notifications.", { variant: "warning" });
            return;
        }

        setNotificationLoadingIndex(mode === "all" ? "all" : index);

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
                    enqueueSnackbar("All notifications cleared.", { variant: "success" });
                } else if (mode === "index") {
                    setNotification((prev) => prev.filter((_, i) => i !== index));
                    if (setAuthAdmin) setAuthAdmin((prev) => prev ? { ...prev, notifications: (prev.notifications || []).filter((_, i) => i !== index) } : null);
                    if (setAuthUser) setAuthUser((prev) => prev ? { ...prev, notifications: (prev.notifications || []).filter((_, i) => i !== index) } : null);
                }
            } else {
                enqueueSnackbar(res?.message || "Failed to remove notification.", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Server error.", { variant: "error" });
        } finally {
            setNotificationLoadingIndex(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        const targetId = authAdmin?._id || authUser?._id;
        if (!targetId) return;
        try {
            await markNotificationAsRead(targetId, null, "all");
            setNotification((prev) => prev.map((n) => ({ ...n, isRead: true })));
            if (setAuthAdmin) setAuthAdmin((prev) => prev ? { ...prev, notifications: (prev.notifications || []).map(n => ({ ...n, isRead: true })) } : null);
            if (setAuthUser) setAuthUser((prev) => prev ? { ...prev, notifications: (prev.notifications || []).map(n => ({ ...n, isRead: true })) } : null);
            enqueueSnackbar("All notifications marked as read.", { variant: "success" });
        } catch (err) {
            console.error("handleMarkAllAsRead error:", err);
        }
    };

    const handleNotificationClick = async (item, idx) => {
        const targetId = authAdmin?._id || authUser?._id;
        if (targetId && item?._id) {
            markNotificationAsRead(targetId, item._id, "single").catch(() => {});
            setNotification((prev) => prev.map((n, i) => (i === idx || n._id === item._id) ? { ...n, isRead: true } : n));
        }
        setNotificationOpen(false);

        const targetOrderId = item?.orderId || item?.order?._id;
        const isOrderNotif = item?.type === "order" || Boolean(targetOrderId) || (item?.title && /order/i.test(item.title));

        if (isOrderNotif && targetOrderId) {
            navigate(`/admin/orders?orderId=${targetOrderId}`, { state: { orderId: targetOrderId } });
        } else {
            navigate("/admin/orders");
        }
    };

    const isDark = theme === "dark";

    return (
        <nav className="sticky top-0 z-50 w-full py-3 px-3 sm:px-6 lg:px-8 transition-all duration-300 bg-[#EFF1F5]/80 dark:bg-gray-900/80 backdrop-blur-md">
            {/* Pill Container */}
            <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800/95 rounded-full px-4 sm:px-6 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-white/80 dark:border-gray-700 flex items-center justify-between transition-all duration-300 relative">

                {/* Left: Sidebar Toggle */}
                <div className="flex items-center gap-2.5 sm:gap-3 z-10">
                    <button
                        className="w-9 h-9 rounded-full bg-purple-50 dark:bg-gray-700 text-[#6C5CE7] dark:text-purple-300 flex items-center justify-center hover:scale-105 transition cursor-pointer border border-purple-100 dark:border-gray-600 shrink-0"
                        onClick={handleSidebarToggle}
                        title="Toggle Sidebar Menu"
                    >
                        <MenuIcon sx={{ fontSize: "1.2rem" }} />
                    </button>
                </div>

                {/* Center: Brand Name */}
                <Link
                    to="/admin/dashboard"
                    className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 no-underline cursor-pointer select-none"
                >
                    <span className="font-black text-xs sm:text-sm tracking-tight text-[#0F2742] dark:text-white uppercase leading-none">
                        Madhu Dairy
                    </span>
                    <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-[#6C5CE7] dark:text-[#A78BFA] tracking-widest uppercase leading-tight mt-0.5">
                        &amp; Daily Needs
                    </span>
                </Link>

                {/* Right: Bell Button */}
                <div className="flex items-center gap-2 sm:gap-3 z-10">
                    <Tooltip title="Notifications">
                        <button
                            ref={bellRef}
                            onClick={() => setNotificationOpen((prev) => !prev)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
                                notificationOpen
                                    ? "bg-[#6C5CE7]/15 text-[#6C5CE7] scale-105"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-[#6C5CE7]/10 hover:text-[#6C5CE7]"
                            }`}
                        >
                            <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
                            {notification?.length > 0 && authAdmin && (
                                <span
                                    className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#6C5CE7] text-white rounded-full text-[9px] font-black leading-none shadow-[0_2px_8px_rgba(108,92,231,0.5)] ${animate ? "animate-bounce" : ""}`}
                                >
                                    {unreadCount > 0 ? unreadCount : notification.length}
                                </span>
                            )}
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Notification Panel — Dropdown (no Dialog backdrop) */}
            {notificationOpen && (
                <div
                    ref={panelRef}
                    className="fixed z-[9999]"
                    style={{
                        top: 70,
                        right: 16,
                        width: 'min(400px, calc(100vw - 24px)',
                    }}
                >
                    <div
                        className="flex flex-col rounded-[20px] overflow-hidden"
                        style={{
                            maxHeight: '520px',
                            background: isDark ? '#111827' : '#ffffff',
                            boxShadow: isDark
                                ? '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)'
                                : '0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.07)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#6C5CE7]/12 dark:bg-[#6C5CE7]/20 flex items-center justify-center">
                                    <Bell className="w-[15px] h-[15px] text-[#6C5CE7]" strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h2 className="text-[13px] font-black text-gray-900 dark:text-white leading-none tracking-tight">
                                        Notifications
                                    </h2>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                                        {notification.length === 0
                                            ? 'All caught up'
                                            : `${notification.length} notification${notification.length !== 1 ? 's' : ''}`}
                                    </p>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-black px-2 py-[3px] rounded-full bg-[#6C5CE7] text-white shadow-[0_2px_8px_rgba(108,92,231,0.4)]">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setNotificationOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                            >
                                <X size={13} />
                            </button>
                        </div>

                        {/* Action Row */}
                        {notification.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/70 border-b border-gray-100 dark:border-gray-800 shrink-0">
                                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
                                </span>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="flex items-center gap-1 text-[11px] font-bold text-[#6C5CE7] dark:text-purple-400 hover:text-[#5b4bc4] dark:hover:text-purple-300 transition cursor-pointer"
                                        >
                                            <CheckCheck size={12} strokeWidth={2.5} />
                                            <span>Mark all read</span>
                                        </button>
                                    )}
                                    <button
                                        disabled={notificationLoadingIndex !== null}
                                        onClick={() => handleRemoveNotification(-1, "all")}
                                        className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:text-[#6C5CE7] dark:hover:text-purple-200 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {notificationLoadingIndex === "all" ? (
                                            <div className="w-3 h-3 border-2 border-t-transparent border-[#6C5CE7] rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <X size={11} />
                                                <span>Clear all</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain' }}>
                            {notification.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                                    <div className="w-14 h-14 rounded-full bg-[#6C5CE7]/10 dark:bg-[#6C5CE7]/20 flex items-center justify-center text-2xl mb-3">🎉</div>
                                    <p className="font-black text-sm text-gray-800 dark:text-white">All caught up!</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No new notifications right now.</p>
                                </div>
                            ) : (
                                <ul className="p-3 space-y-2">
                                    {notification.map((item, idx) => {
                                        const isUnread = !item?.isRead;
                                        return (
                                            <li
                                                key={item?._id || item?.id || `admin-notif-${idx}`}
                                                onClick={() => handleNotificationClick(item, idx)}
                                                className={`group relative p-3 rounded-2xl border transition-all duration-150 cursor-pointer ${
                                                    isUnread
                                                        ? 'bg-[#6C5CE7]/06 dark:bg-[#6C5CE7]/12 border-[#6C5CE7]/20 dark:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/10 dark:hover:bg-[#6C5CE7]/20'
                                                        : 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    {/* Status Dot */}
                                                    <div className="mt-[5px] shrink-0">
                                                        <span className={`block w-2 h-2 rounded-full ${isUnread ? 'bg-[#6C5CE7]' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-[12px] font-bold leading-tight ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                            {item?.title}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                                                            {item?.description}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-semibold">
                                                            {item?.date
                                                                ? formatDistanceToNow(new Date(item.date), { addSuffix: true })
                                                                : 'Just now'}
                                                        </p>
                                                    </div>

                                                    {/* Per-item Dismiss */}
                                                    <button
                                                        disabled={notificationLoadingIndex !== null}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveNotification(idx, "index");
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 mt-0.5 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-[#6C5CE7] hover:bg-purple-50 dark:hover:bg-purple-900/40 transition cursor-pointer disabled:cursor-not-allowed shrink-0"
                                                        title="Dismiss"
                                                    >
                                                        {notificationLoadingIndex === idx ? (
                                                            <div className="w-3 h-3 border-2 border-t-transparent border-gray-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <X size={11} />
                                                        )}
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
