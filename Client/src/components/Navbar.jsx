import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from "date-fns";
import {
    Box, Drawer, Avatar, IconButton, Badge, Tooltip,
    Dialog, Menu, MenuItem
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MenuIcon from '@mui/icons-material/Menu';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CallIcon from '@mui/icons-material/Call';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

import { motion } from "framer-motion";
import { ThemeContext } from '../context/ThemeProvider';
import { AdminAuthContext, UserAuthContext } from "../context/AuthProvider"
import { CartContext } from '../context/CartProvider';
import { UserOrderContext } from '../context/UserOrderProvider';
import { Bell, X, ShoppingBag, Info, Home, Headphones, User, Heart, ShoppingCart, CheckCheck } from 'lucide-react';
import Slide from '@mui/material/Slide';
import { removeUserNotification } from '../services/userProfileService';
import { removeAdminNotification } from '../services/adminService';
import { markNotificationAsRead } from '../services/notificationService';
import { useSnackbar } from 'notistack';
import UserProfileSidebar from './UserProfileSidebar';
import company from "../data/company.json";
import logoDarkMode from "../assets/logoDarkMode.png";
import logoLightMode from "../assets/logoLightMode.png";
import cowLogoImg from "../assets/cow.png";
import brandNameTxtImg from "../assets/brand name txt.png";

import { getGuestWishlist } from '../utils/guestWishlist';
import { prefetchProducts, prefetchPageContent } from '../utils/prefetch';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Navbar() {

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const location = useLocation();
    const isCheckoutPage = location.pathname.includes("checkout");
    const isCartPage = location.pathname.includes("cart");
    const isProductsPage = location.pathname === "/products" || location.pathname.startsWith("/products");
    const hideNavItems = isCheckoutPage || isCartPage;

    const { theme, toggleTheme } = useContext(ThemeContext);
    const { authUser, setAuthUser, authUserLoading, handleUserLogout, setOpenLoginDialog } = useContext(UserAuthContext);
    const { authAdmin, setAuthAdmin, authAdminLoading, handleAdminLogout } = useContext(AdminAuthContext);
    const { cartItems } = useContext(CartContext);
    const { notification, setNotification, unreadCount } = useContext(UserOrderContext);

    const [guestWishlistCount, setGuestWishlistCount] = useState(() => getGuestWishlist().length);

    useEffect(() => {
        const updateGuestCount = () => setGuestWishlistCount(getGuestWishlist().length);
        window.addEventListener("guestWishlistUpdated", updateGuestCount);
        return () => window.removeEventListener("guestWishlistUpdated", updateGuestCount);
    }, []);

    const activeWishlist = authUser?.wishlistedProducts || authAdmin?.wishlistedProducts || null;
    const wishlistCount = activeWishlist !== null
        ? (Array.isArray(activeWishlist)
            ? activeWishlist.filter(item => {
                if (!item) return false;
                if (typeof item === "string") return Boolean(item.trim() && item !== "null" && item !== "undefined");
                if (typeof item === "object") return Boolean(item._id);
                return false;
              }).length
            : 0)
        : guestWishlistCount;

    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerWidth >= 1024) {
                setIsScrolling(false);
                return;
            }

            setIsScrolling(true);

            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 250);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const [open, setOpen] = useState(false);
    const [userProfileDrawer, setUserProfileDrawer] = useState(false);
    const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
    const openAdminMenu = Boolean(adminMenuAnchor);

    const handleAdminMenuClick = (event) => {
        setAdminMenuAnchor(event.currentTarget);
    };
    const handleAdminMenuClose = () => {
        setAdminMenuAnchor(null);
    };
    const [notificationLoadingIndex, setNotificationLoadingIndex] = useState(null);
    const [animate, setAnimate] = useState(false);
    const [notificationDialog, setNotificationDialog] = useState(false);
    const prevCountRef = useRef(notification.length);
    const bellBtnRef = useRef(null);
    const notifPanelRef = useRef(null);

    useEffect(() => {
        if (notification.length > prevCountRef.current) {
            setAnimate(true);
            setTimeout(() => setAnimate(false), 2600);
        }
        prevCountRef.current = notification.length;
    }, [notification.length]);

    // Close notification panel on outside click
    useEffect(() => {
        if (!notificationDialog) return;
        const handleOutside = (e) => {
            if (
                notifPanelRef.current && !notifPanelRef.current.contains(e.target) &&
                bellBtnRef.current && !bellBtnRef.current.contains(e.target)
            ) {
                setNotificationDialog(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [notificationDialog]);

    const toggleDrawer = (newOpen) => () => setOpen(newOpen);

    const linkStyle = "text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white flex items-center gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer";
    const activeLinkStyle = "bg-gray-500/20 dark:bg-[#00000091] dark:text-white";

    const navItems = [
        { label: 'Home', icon: <HomeIcon sx={{ fontSize: '1.2rem' }} />, path: '/home' },
        { label: 'Products', icon: <StorefrontIcon sx={{ fontSize: '1.2rem' }} />, path: '/products' },
        { label: 'About Us', icon: <Diversity3Icon sx={{ fontSize: '1.2rem' }} />, path: '/about' },
        { label: 'Contact Us', icon: <CallIcon sx={{ fontSize: '1.2rem' }} />, path: '/contact-us' },
    ];

    const handleLogout = () => {
        setOpen(false);
        handleUserLogout();
        setOpenLoginDialog(true);
        enqueueSnackbar("User Logged Out Successfully", { variant: "success" });
        navigate("/home", { replace: true });
    }

    const handleUserCart = () => {
        setOpen(false);
        navigate("/cart");
    }

    const handleUserWishlist = () => {
        setOpen(false);
        navigate(authUser || authAdmin ? "/user-profile/wishlist" : "/wishlist");
    }

    const handleRemoveNotification = async (index, mode) => {
        const userId = authUser?._id;
        const adminId = authAdmin?._id;

        if (!userId && !adminId) {
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
                    if (setAuthUser) setAuthUser((prev) => prev ? { ...prev, notifications: [] } : null);
                    if (setAuthAdmin) setAuthAdmin((prev) => prev ? { ...prev, notifications: [] } : null);
                    enqueueSnackbar(res?.message || "Notifications cleared successfully.", { variant: "success" });
                } else if (mode === "index") {
                    setNotification((prev) => prev.filter((_, i) => i !== index));
                    if (setAuthUser) setAuthUser((prev) => prev ? { ...prev, notifications: (prev.notifications || []).filter((_, i) => i !== index) } : null);
                    if (setAuthAdmin) setAuthAdmin((prev) => prev ? { ...prev, notifications: (prev.notifications || []).filter((_, i) => i !== index) } : null);
                    enqueueSnackbar(res?.message || "Notification removed successfully.", { variant: "success" });
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

    const handleMarkAllAsRead = async () => {
        const userId = authUser?._id;
        const adminId = authAdmin?._id;
        const targetId = userId || adminId;
        if (!targetId) return;

        try {
            await markNotificationAsRead(targetId, null, "all");
            setNotification((prev) => prev.map((n) => ({ ...n, isRead: true })));
            if (setAuthUser) setAuthUser((prev) => prev ? { ...prev, notifications: (prev.notifications || []).map(n => ({ ...n, isRead: true })) } : null);
            if (setAuthAdmin) setAuthAdmin((prev) => prev ? { ...prev, notifications: (prev.notifications || []).map(n => ({ ...n, isRead: true })) } : null);
            enqueueSnackbar("All notifications marked as read.", { variant: "success" });
        } catch (err) {
            console.error("handleMarkAllAsRead error:", err);
        }
    };

    const handleNotificationClick = async (item, idx) => {
        const userId = authUser?._id || authAdmin?._id;
        if (userId && item?._id) {
            markNotificationAsRead(userId, item._id, "single").catch(() => {});
            setNotification((prev) => prev.map((n, i) => (i === idx || n._id === item._id) ? { ...n, isRead: true } : n));
        }
        setNotificationDialog(false);

        const targetOrderId = item?.orderId || item?.order?._id;
        const isOrderNotif = item?.type === "order" || Boolean(targetOrderId) || (item?.title && /order/i.test(item.title));
        const isLoginNotif = item?.type === "login" || (item?.title && /login/i.test(item.title));

        if (authAdmin) {
            if (isOrderNotif && targetOrderId) {
                navigate(`/admin/orders?orderId=${targetOrderId}`, { state: { orderId: targetOrderId } });
            } else {
                navigate("/admin/orders");
            }
        } else {
            if (isOrderNotif) {
                if (targetOrderId) {
                    navigate(`/user-profile/orders?orderId=${targetOrderId}`, { state: { orderId: targetOrderId } });
                } else {
                    navigate("/user-profile/orders");
                }
            } else if (isLoginNotif) {
                navigate("/user-profile");
            } else {
                navigate("/user-profile");
            }
        }
    };

    const displayLogo = theme === "dark" ? logoDarkMode : logoLightMode;

    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
    const openProfileMenu = Boolean(profileMenuAnchor);
    const handleProfileMenuClose = () => {
        setProfileMenuAnchor(null);
    };

    const handleProfileClick = () => {
        if (authAdmin) {
            navigate("/admin/dashboard");
        } else if (authUser) {
            navigate("/user-profile");
        } else {
            if (location.pathname !== "/login" && location.pathname !== "/signup") {
                sessionStorage.setItem("redirectAfterLogin", location.pathname + location.search);
            }
            navigate("/login", { state: { from: location.pathname + location.search } });
        }
    };

    let renderUserSection;

    if (authUserLoading || authAdminLoading) {
        renderUserSection = (
            <div className="flex items-center space-x-3 animate-pulse">
                <div className="rounded-full bg-gray-300/70 dark:bg-gray-500/30 h-10 w-10 shadow"></div>
            </div>
        );

    } else if (authAdmin) {
        renderUserSection = (
            <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm border border-white dark:border-gray-700 rounded-full px-3.5 py-1.5 transition hover:scale-105 cursor-pointer text-[#2D3748] dark:text-white"
                title="Admin Dashboard"
            >
                <PersonIcon sx={{ fontSize: "1.1rem" }} className="text-[#6C5CE7]" />
                <span className="text-xs font-extrabold">
                    {authAdmin?.name || "Super Admin"}
                </span>
            </button>
        );

    } else if (authUser) {
        renderUserSection = (
            <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm border border-white dark:border-gray-700 rounded-full px-3.5 py-1.5 transition hover:scale-105 cursor-pointer text-[#2D3748] dark:text-white"
                title="My Profile"
            >
                <PersonIcon sx={{ fontSize: "1.1rem" }} className="text-[#6C5CE7]" />
                <span className="text-xs font-extrabold">
                    {authUser?.firstName || "User"}
                </span>
            </button>
        );
    } else {
        renderUserSection = (
            <button
                onClick={() => {
                    if (location.pathname !== "/login" && location.pathname !== "/signup") {
                        sessionStorage.setItem("redirectAfterLogin", location.pathname + location.search);
                    }
                    navigate("/login", { state: { from: location.pathname + location.search } });
                }}
                className="btn-reflection flex items-center gap-1.5 text-[#6C5CE7] bg-white dark:bg-gray-800 hover:bg-purple-50 font-extrabold px-4 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-[0_0_18px_rgba(108,92,231,0.4)] hover:scale-105 cursor-pointer border border-white dark:border-gray-700 text-xs relative overflow-hidden periodic-glass-shine"
            >
                <LoginIcon sx={{ fontSize: "1.1rem" }} />
                <span>Login</span>
            </button>
        );
    }


    return (
        <>
            <nav className={`fixed top-0 left-0 w-full z-50 py-1.5 sm:py-2 px-4 sm:px-8 lg:px-12 transition-transform duration-300 ease-in-out glass-navbar rounded-none border-none shadow-none ${
                (isProductsPage || isCartPage || isCheckoutPage) ? "hidden md:block" : ""
            } ${
                isScrolling ? "-translate-y-full lg:translate-y-0" : "translate-y-0"
            }`}>
                <div className="w-full max-w-7xl mx-auto flex items-center justify-between relative">
                    {/* Desktop View Brand Logo */}
                    <Link to="/" className="hidden md:flex items-center hover:scale-105 transition-transform py-0.5 z-10">
                        <img
                            src={displayLogo}
                            alt={company?.name || "Madhu Dairy & Daily Needs"}
                            loading="eager"
                            decoding="sync"
                            className="h-8 sm:h-9 md:h-10 lg:h-10.5 w-auto object-contain drop-shadow-sm transition-all duration-300"
                        />
                    </Link>

                    {/* Mobile View Brand Logo: Cow Logo on Left */}
                    <Link to="/" className="flex md:hidden items-center hover:scale-105 transition-transform py-0.5 z-10">
                        <img
                            src={cowLogoImg}
                            alt="Madhu Dairy Cow Logo"
                            className="h-8 w-auto object-contain drop-shadow-sm"
                        />
                    </Link>

                    {/* Mobile View Centered Madhu Dairy Name (Only Name, No Cow Image) */}
                    <Link
                        to="/"
                        className="md:hidden absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 no-underline cursor-pointer select-none"
                    >
                        <span className="font-black text-xs sm:text-sm tracking-tight text-[#0F2742] dark:text-white uppercase leading-none">
                            Madhu Dairy
                        </span>
                        <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-[#6C5CE7] dark:text-[#A78BFA] tracking-widest uppercase leading-tight mt-0.5">
                            &amp; Daily Needs
                        </span>
                    </Link>


                    {/* Center Navigation Links: Default Black Text, Active Violet with Light Glow */}
                    {!hideNavItems && (
                        <div className="hidden md:flex items-center gap-5 sm:gap-8">
                            {navItems.map((item, idx) => {
                                const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                                return (
                                    <Link
                                        key={item.path || idx}
                                        to={item.path}
                                        onMouseEnter={() => {
                                            if (item.path.includes('product')) prefetchProducts();
                                            prefetchPageContent();
                                        }}
                                        onFocus={() => {
                                            if (item.path.includes('product')) prefetchProducts();
                                            prefetchPageContent();
                                        }}
                                        className={`relative py-1 text-sm font-extrabold no-underline transition-all duration-300 cursor-pointer ${
                                            isActive
                                                ? "text-[#6C5CE7] dark:text-[#A78BFA] drop-shadow-[0_0_12px_rgba(108,92,231,0.75)] scale-105"
                                                : "text-black dark:text-white hover:text-[#6C5CE7] dark:hover:text-[#A78BFA] hover:drop-shadow-[0_0_8px_rgba(108,92,231,0.5)]"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Right Action Icons: ♡, 🛍️, 🔔 */}
                    <div className="flex items-center gap-2 sm:gap-3 z-10">
                        {/* Wishlist Pill (Hidden on mobile response) */}
                        <Tooltip title="Wishlist">
                            <button
                                onClick={handleUserWishlist}
                                className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-all duration-300 cursor-pointer relative hover:scale-110 active:scale-95 ${
                                    location.pathname.includes('/wishlist')
                                        ? "bg-rose-100/80 dark:bg-rose-950/60 text-[#FF385C] shadow-[0_0_12px_rgba(255,56,92,0.3)]"
                                        : "text-gray-700 dark:text-gray-200 hover:text-[#FF385C] dark:hover:text-[#FF385C] hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                }`}
                            >
                                <FavoriteBorderIcon sx={{ fontSize: "1.2rem" }} className="transition-colors duration-300" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 font-bold px-1.5 py-0.2 bg-[#FF385C] text-white rounded-full text-[10px] shadow-[0_0_8px_rgba(255,56,92,0.6)] animate-pulse">
                                        {wishlistCount}
                                    </span>
                                )}
                            </button>
                        </Tooltip>

                        {/* Cart Pill (Hidden on mobile response) */}
                        <Tooltip title="Cart">
                            <button
                                onClick={handleUserCart}
                                className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-all duration-300 cursor-pointer relative hover:scale-110 active:scale-95 ${
                                    location.pathname === '/cart'
                                        ? "bg-purple-100/80 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-[#A78BFA] shadow-[0_0_12px_rgba(108,92,231,0.3)]"
                                        : "text-gray-700 dark:text-gray-200 hover:text-[#6C5CE7] dark:hover:text-[#A78BFA] hover:bg-purple-50 dark:hover:bg-purple-950/40"
                                }`}
                            >
                                <ShoppingCartIcon sx={{ fontSize: "1.1rem" }} className="transition-colors duration-300" />
                                {(cartItems?.length || 0) > 0 && (
                                    <span className="absolute -top-1 -right-1 font-bold px-1.5 py-0.2 bg-[#6C5CE7] text-white rounded-full text-[10px] shadow-[0_0_8px_#6C5CE7]">
                                        {cartItems?.length}
                                    </span>
                                )}
                            </button>
                        </Tooltip>

                        {/* Notifications Pill (Visible on both Mobile & Desktop) */}
                        {(authUser || authAdmin) && !isCheckoutPage && (
                            <Tooltip title="Notifications">
                                <button
                                    ref={bellBtnRef}
                                    onClick={() => setNotificationDialog((p) => !p)}
                                    className={`flex w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full items-center justify-center transition-all duration-300 cursor-pointer relative hover:scale-110 active:scale-95 ${
                                        notificationDialog
                                            ? "bg-amber-100/80 dark:bg-amber-950/60 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                                            : "text-gray-700 dark:text-gray-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                    }`}
                                >
                                    <Bell className="w-4.5 h-4.5 sm:w-4 sm:h-4 transition-colors duration-300" />
                                    {(unreadCount > 0 || notification?.length > 0) && (
                                        <span className="absolute -top-1 -right-1 font-bold px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse">
                                            {unreadCount > 0 ? unreadCount : notification.length}
                                        </span>
                                    )}
                                </button>
                            </Tooltip>
                        )}

                        {/* User Badge Pill [👤 Super / User] (Hidden on mobile responsive, visible on desktop) */}
                        <div className="hidden md:flex items-center">
                            {renderUserSection}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Universal Profile Dropdown Menu for Desktop & Mobile */}
            <Menu
                anchorEl={profileMenuAnchor}
                open={openProfileMenu}
                onClose={handleProfileMenuClose}
                PaperProps={{
                    sx: {
                        mb: 1,
                        mt: 1,
                        minWidth: 240,
                        borderRadius: 3,
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.15)",
                        padding: "6px 0",
                    },
                }}
            >
                {authAdmin ? (
                    <Box key="admin-menu-container">
                        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-black text-gray-800 dark:text-gray-100">
                                {authAdmin?.name || "MADHU Admin"}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {authAdmin?.email || "admin@MADHUdairy.com"}
                            </p>
                            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-100 text-[#6C5CE7] rounded-full">
                                Administrator & Shopper
                            </span>
                        </div>

                        <MenuItem
                            onClick={() => {
                                handleProfileMenuClose();
                                navigate("/admin/dashboard");
                            }}
                            className="flex items-center gap-2.5 !py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:!bg-purple-50 dark:hover:!bg-gray-800"
                        >
                            <DashboardIcon fontSize="small" className="text-[#6C5CE7]" />
                            <span>Admin Dashboard</span>
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                handleProfileMenuClose();
                                navigate("/admin/profile");
                            }}
                            className="flex items-center gap-2.5 !py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:!bg-purple-50 dark:hover:!bg-gray-800"
                        >
                            <PersonIcon fontSize="small" className="text-[#6C5CE7]" />
                            <span>Admin Profile</span>
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                handleProfileMenuClose();
                                handleAdminLogout();
                                enqueueSnackbar("Admin Logged Out Successfully", { variant: "info" });
                                navigate("/");
                            }}
                            className="flex items-center gap-2.5 !py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-950/40 border-t border-gray-100 dark:border-gray-800"
                        >
                            <LogoutIcon fontSize="small" className="text-red-500" />
                            <span>Logout</span>
                        </MenuItem>
                    </Box>
                ) : authUser ? (
                    <Box key="user-menu-container">
                        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-black text-gray-800 dark:text-gray-100">
                                {authUser?.firstName} {authUser?.lastName}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {authUser?.email}
                            </p>
                            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-green-100 text-green-800 rounded-full">
                                Customer Account
                            </span>
                        </div>

                        <MenuItem
                            onClick={() => {
                                handleProfileMenuClose();
                                navigate("/user-profile");
                            }}
                            className="flex items-center gap-2.5 !py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:!bg-purple-50 dark:hover:!bg-gray-800"
                        >
                            <PersonIcon fontSize="small" className="text-[#6C5CE7]" />
                            <span>My Profile</span>
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                handleProfileMenuClose();
                                navigate("/user-profile/orders");
                            }}
                            className="flex items-center gap-2.5 !py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:!bg-purple-50 dark:hover:!bg-gray-800"
                        >
                            <ShoppingCartIcon fontSize="small" className="text-[#6C5CE7]" />
                            <span>My Orders</span>
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                handleProfileMenuClose();
                                handleUserLogout();
                                enqueueSnackbar("Logged Out Successfully", { variant: "success" });
                                navigate("/");
                            }}
                            className="flex items-center gap-2.5 !py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-950/40 border-t border-gray-100 dark:border-gray-800"
                        >
                            <LogoutIcon fontSize="small" className="text-red-500" />
                            <span>Logout</span>
                        </MenuItem>
                    </Box>
                ) : null}
            </Menu>

            {/* Mobile Bottom Navigation Bar */}
            {!location.pathname.startsWith('/product-details') && !isCheckoutPage && (
                <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 pb-[env(safe-area-inset-bottom)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-gray-200/80 dark:border-gray-800/80 shadow-[0_-6px_25px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 transition-transform duration-300 ease-in-out ${
                    isScrolling ? "translate-y-full" : "translate-y-0"
                }`}>
                    {/* 1. Products */}
                    <Link
                        to="/products"
                        className={`flex flex-col items-center justify-center w-14 py-1 text-xs font-semibold transition-all ${
                            location.pathname.startsWith('/products')
                                ? "text-[#6C5CE7] dark:text-[#A78BFA] font-black scale-105"
                                : "text-slate-700 dark:text-slate-300 hover:text-[#6C5CE7] dark:hover:text-[#A78BFA]"
                        }`}
                    >
                        <ShoppingBag className={`w-5 h-5 transition-all duration-200 ${
                            location.pathname.startsWith('/products') ? 'stroke-[2.5] scale-110 drop-shadow-[0_2px_8px_rgba(108,92,231,0.4)]' : 'stroke-[1.8]'
                        }`} />
                        <span className="text-[11px] mt-1 font-extrabold tracking-tight">Products</span>
                    </Link>

                    {/* 2. Wishlist */}
                    <button
                        onClick={handleUserWishlist}
                        className={`flex flex-col items-center justify-center w-14 py-1 text-xs font-semibold transition-all cursor-pointer ${
                            location.pathname.includes('/wishlist')
                                ? "text-[#FF385C] font-black scale-105"
                                : "text-slate-700 dark:text-slate-300 hover:text-[#FF385C]"
                        }`}
                    >
                        <div className="relative">
                            <Heart className={`w-5 h-5 transition-all duration-200 ${
                                location.pathname.includes('/wishlist') ? 'stroke-[2.5] scale-110 drop-shadow-[0_2px_8px_rgba(255,56,92,0.4)] fill-[#FF385C]' : 'stroke-[1.8]'
                            }`} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-2 font-extrabold px-1.5 py-0.2 bg-[#FF385C] text-white rounded-full text-[9px] shadow-[0_0_6px_rgba(255,56,92,0.6)]">
                                    {wishlistCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] mt-1 font-extrabold tracking-tight">Wishlist</span>
                    </button>

                    {/* 3. Centralized Home Button */}
                    <Link
                        to="/home"
                        className="flex flex-col items-center justify-center -mt-6 group cursor-pointer"
                    >
                        <div className={`p-3 rounded-full border-4 border-white dark:border-slate-900 shadow-xl transition-all duration-300 ${
                            location.pathname === '/home' || location.pathname === '/'
                                ? "bg-gradient-to-tr from-[#6C5CE7] to-[#805AD5] text-white scale-110 shadow-[0_4px_20px_rgba(108,92,231,0.5)] ring-2 ring-[#6C5CE7]/30"
                                : "bg-white dark:bg-gray-800 text-[#6C5CE7] dark:text-[#A78BFA] border border-purple-200/80 dark:border-purple-800/80 group-hover:scale-105"
                        }`}>
                            <Home className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <span className={`text-[11px] font-extrabold mt-0.5 ${
                            location.pathname === '/home' || location.pathname === '/'
                                ? "text-[#6C5CE7] dark:text-[#A78BFA] font-black"
                                : "text-slate-800 dark:text-slate-200"
                        }`}>
                            Home
                        </span>
                    </Link>

                    {/* 4. Cart */}
                    <button
                        onClick={handleUserCart}
                        className={`flex flex-col items-center justify-center w-14 py-1 text-xs font-semibold transition-all cursor-pointer ${
                            location.pathname === '/cart'
                                ? "text-[#6C5CE7] dark:text-[#A78BFA] font-black scale-105"
                                : "text-slate-700 dark:text-slate-300 hover:text-[#6C5CE7] dark:hover:text-[#A78BFA]"
                        }`}
                    >
                        <div className="relative">
                            <ShoppingCart className={`w-5 h-5 transition-all duration-200 ${
                                location.pathname === '/cart' ? 'stroke-[2.5] scale-110 drop-shadow-[0_2px_8px_rgba(108,92,231,0.4)]' : 'stroke-[1.8]'
                            }`} />
                            {(cartItems?.length || 0) > 0 && (
                                <span className="absolute -top-1 -right-2 font-extrabold px-1.5 py-0.2 bg-[#6C5CE7] text-white rounded-full text-[9px] shadow-[0_0_6px_rgba(108,92,231,0.6)]">
                                    {cartItems?.length}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] mt-1 font-extrabold tracking-tight">Cart</span>
                    </button>

                    {/* 5. Profile (Right-most) */}
                    <button
                        onClick={handleProfileClick}
                        className={`flex flex-col items-center justify-center w-14 py-1 text-xs font-semibold transition-all cursor-pointer ${
                            location.pathname.startsWith('/user-profile') || location.pathname.startsWith('/admin')
                                ? "text-[#6C5CE7] dark:text-[#A78BFA] font-black scale-105"
                                : "text-slate-700 dark:text-slate-300 hover:text-[#6C5CE7] dark:hover:text-[#A78BFA]"
                        }`}
                    >
                        {authUser?.photo ? (
                            <Avatar
                                alt={authUser?.firstName}
                                src={authUser?.photo}
                                sx={{ width: 22, height: 22, border: "1.5px solid #6C5CE7" }}
                            />
                        ) : (
                            <User className={`w-5 h-5 transition-all duration-200 ${
                                location.pathname.startsWith('/user-profile') || location.pathname.startsWith('/admin') ? 'stroke-[2.5] scale-110 drop-shadow-[0_2px_8px_rgba(108,92,231,0.4)]' : 'stroke-[1.8]'
                            }`} />
                        )}
                        <span className="text-[11px] mt-1 font-extrabold tracking-tight">Profile</span>
                    </button>
                </nav>
            )}

            {/* User Notification Panel — Native Dropdown (no Dialog backdrop) */}
            {notificationDialog && (
                <div
                    ref={notifPanelRef}
                    className="fixed z-[9999]"
                    style={{
                        top: 70,
                        right: 16,
                        width: 'min(390px, calc(100vw - 24px))',
                    }}
                >
                    <div
                        className="flex flex-col rounded-[20px] overflow-hidden"
                        style={{
                            maxHeight: '520px',
                            background: theme === 'dark' ? '#111827' : '#ffffff',
                            boxShadow: theme === 'dark'
                                ? '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)'
                                : '0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.07)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Bell className="w-[15px] h-[15px] text-amber-500" strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h2 className="text-[13px] font-black text-gray-900 dark:text-white leading-none tracking-tight">Notifications</h2>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                                        {notification.length === 0 ? 'All caught up' : `${notification.length} notification${notification.length !== 1 ? 's' : ''}`}
                                    </p>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-black px-2 py-[3px] rounded-full bg-amber-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.4)] ml-1">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setNotificationDialog(false)}
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
                                            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition cursor-pointer"
                                        >
                                            <CheckCheck size={12} strokeWidth={2.5} />
                                            <span>Mark all read</span>
                                        </button>
                                    )}
                                    <button
                                        disabled={notificationLoadingIndex !== null}
                                        onClick={() => handleRemoveNotification(-1, 'all')}
                                        className="flex items-center gap-1 text-[11px] font-bold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {notificationLoadingIndex === 'all' ? (
                                            <div className="w-3 h-3 border-2 border-t-transparent border-red-500 rounded-full animate-spin" />
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

                        {/* Notification List */}
                        <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain' }}>
                            {notification.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                                    <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-2xl mb-3">🎉</div>
                                    <p className="font-black text-sm text-gray-800 dark:text-white">All caught up!</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No new notifications right now.</p>
                                </div>
                            ) : (
                                <ul className="p-3 space-y-2">
                                    {notification.map((item, idx) => {
                                        const isUnread = !item?.isRead;
                                        return (
                                            <li
                                                key={item?._id || item?.id || `notif-${idx}`}
                                                onClick={() => handleNotificationClick(item, idx)}
                                                className={`group relative p-3 rounded-2xl border transition-all duration-150 cursor-pointer ${
                                                    isUnread
                                                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100/80 dark:hover:bg-amber-950/50'
                                                        : 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    {/* Status Dot */}
                                                    <div className="mt-[5px] shrink-0">
                                                        <span className={`block w-2 h-2 rounded-full ${isUnread ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
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
                                                            {item?.date ? formatDistanceToNow(new Date(item.date), { addSuffix: true }) : 'Just now'}
                                                        </p>
                                                    </div>

                                                    {/* Per-item Dismiss */}
                                                    <button
                                                        disabled={notificationLoadingIndex !== null}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveNotification(idx, 'index');
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 mt-0.5 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition cursor-pointer disabled:cursor-not-allowed shrink-0"
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

            <SwipeableDrawer
                anchor="top"
                open={userProfileDrawer}
                onClose={() => setUserProfileDrawer(false)}
                onOpen={() => setUserProfileDrawer(true)}
                className="md:hidden"
                slotProps={{
                    paper: {
                        sx: {
                            width: '100%',
                            backgroundColor: 'transparent',
                        },
                    },
                }}
            >
                <div className="dark:bg-black relative">

                    <button
                        onClick={() => setUserProfileDrawer(false)}
                        className="flex justify-center items-center absolute top-3 right-3 transform text-[#6d286e] bg-[#762e7720] w-10 h-10 rounded text-xl backdrop-blur-md cursor-pointer z-50"
                    >
                        <X />
                    </button>

                    <UserProfileSidebar userProfileDrawer={userProfileDrawer} setUserProfileDrawer={setUserProfileDrawer}/>
                </div>
            </SwipeableDrawer>
        </>
    );
}
