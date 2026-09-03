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
import { Bell, X } from 'lucide-react';
import Slide from '@mui/material/Slide';
import { removeUserNotification } from '../services/userProfileService';
import { removeAdminNotification } from '../services/adminService';
import { useSnackbar } from 'notistack';
import UserProfileSidebar from './UserProfileSidebar';
import company from "../data/company.json";
import logoDarkMode from "../assets/logoDarkMode.png";
import logoLightMode from "../assets/logoLightMode.png";

import { getGuestWishlist } from '../utils/guestWishlist';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Navbar() {

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const location = useLocation();
    const loginUser = localStorage.getItem("User");

    const { theme, toggleTheme } = useContext(ThemeContext);
    const { authUser, setAuthUser, authUserLoading, handleUserLogout, setOpenLoginDialog } = useContext(UserAuthContext);
    const { authAdmin, setAuthAdmin, authAdminLoading, handleAdminLogout } = useContext(AdminAuthContext);
    const { cartItems } = useContext(CartContext);
    const { notification, setNotification } = useContext(UserOrderContext);

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

    useEffect(() => {
        if (notification.length > prevCountRef.current) {
            setAnimate(true);
            setTimeout(() => setAnimate(false), 2600);
        }
        prevCountRef.current = notification.length;
    }, [notification.length]);

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
        navigate("/");
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

    const displayLogo = theme === "dark"
        ? (company?.logoDaraTheme || logoDarkMode)
        : (company?.logoLightTheme || logoLightMode);

    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
    const openProfileMenu = Boolean(profileMenuAnchor);

    const handleProfileMenuClick = (event) => {
        setProfileMenuAnchor(event.currentTarget);
    };
    const handleProfileMenuClose = () => {
        setProfileMenuAnchor(null);
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
                onClick={handleProfileMenuClick}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm border border-white dark:border-gray-700 rounded-full px-3.5 py-1.5 transition hover:scale-105 cursor-pointer text-[#2D3748] dark:text-white"
                title="Admin Profile Menu"
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
                onClick={handleProfileMenuClick}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm border border-white dark:border-gray-700 rounded-full px-3.5 py-1.5 transition hover:scale-105 cursor-pointer text-[#2D3748] dark:text-white"
                title="User Profile Menu"
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
                className="btn-reflection flex items-center gap-1.5 text-[#6C5CE7] bg-white dark:bg-gray-800 hover:bg-purple-50 font-extrabold px-4 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-[0_0_18px_rgba(108,92,231,0.4)] hover:scale-105 cursor-pointer border border-white dark:border-gray-700 text-xs relative overflow-hidden"
            >
                <LoginIcon sx={{ fontSize: "1.1rem" }} />
                <span>Login</span>
            </button>
        );
    }


    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 w-full py-2 sm:py-2.5 px-4 sm:px-8 lg:px-12 transition-all duration-300 bg-white/20 dark:bg-black/30 backdrop-blur-md border-b border-white/30 dark:border-white/10 shadow-none flex items-center justify-between ${location.pathname.startsWith('/product-details') ? 'hidden md:flex' : 'flex'}`}>
                
                {/* Left Brand Container: Official Madhur Dairy Logo */}
                <Link to="/" className="flex items-center hover:scale-105 transition-transform py-0.5">
                    <img
                        src={displayLogo}
                        alt={company?.name || "Madhur Dairy"}
                        loading="eager"
                        decoding="sync"
                        className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-sm"
                    />
                </Link>

                    {/* Center Navigation Links: Default Black Text, Active Violet with Light Glow */}
                    <div className="hidden md:flex items-center gap-5 sm:gap-8">
                        {navItems.map((item, idx) => {
                            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.path || idx}
                                    to={item.path}
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

                    {/* Right Action Icons: ♡, 🛍️, 🔔 */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Wishlist Pill */}
                        <Tooltip title="Wishlist">
                            <button
                                onClick={handleUserWishlist}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative hover:scale-110 active:scale-95 ${
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

                        {/* Cart Pill */}
                        <Tooltip title="Cart">
                            <button
                                onClick={handleUserCart}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative hover:scale-110 active:scale-95 ${
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

                        {/* Notifications Pill */}
                        {(authUser || authAdmin) && (
                            <Tooltip title="Notifications">
                                <button
                                    onClick={() => setNotificationDialog(true)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative hover:scale-110 active:scale-95 ${
                                        notificationDialog
                                            ? "bg-amber-100/80 dark:bg-amber-950/60 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                                            : "text-gray-700 dark:text-gray-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                    }`}
                                >
                                    <Bell className="w-4 h-4 transition-colors duration-300" />
                                    {notification?.length > 0 && (
                                        <span className="absolute -top-1 -right-1 font-bold px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                                            {notification.length}
                                        </span>
                                    )}
                                </button>
                            </Tooltip>
                        )}

                        {/* User Badge Pill [👤 Super / User] */}
                        {renderUserSection}
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
                                {authAdmin?.name || "Madhur Admin"}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {authAdmin?.email || "admin@madhurdairy.com"}
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
            {!location.pathname.startsWith('/product-details') && (
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#001f3f]/95 dark:bg-[#0f172a]/95 backdrop-blur-lg border-t border-blue-400/30 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] flex items-center justify-around px-2">
                    {/* 1. Products */}
                    <Link
                        to="/products"
                        className={`flex flex-col items-center justify-center w-14 py-1 text-xs font-semibold transition-all ${
                            location.pathname.startsWith('/products')
                                ? "text-sky-300 font-bold scale-105"
                                : "text-blue-100/70 hover:text-white"
                        }`}
                    >
                        <StorefrontIcon sx={{ fontSize: "1.35rem" }} />
                        <span className="text-[10px] mt-0.5 font-bold">Products</span>
                    </Link>

                    {/* 2. About Us */}
                    <Link
                        to="/about"
                        className={`flex flex-col items-center justify-center w-14 py-1 text-xs font-semibold transition-all ${
                            location.pathname.startsWith('/about')
                                ? "text-sky-300 font-bold scale-105"
                                : "text-blue-100/70 hover:text-white"
                        }`}
                    >
                        <Diversity3Icon sx={{ fontSize: "1.35rem" }} />
                        <span className="text-[10px] mt-0.5 font-bold">About</span>
                    </Link>

                    {/* 3. Centralized Home Button */}
                    <Link
                        to="/home"
                        className="flex flex-col items-center justify-center -mt-6 group cursor-pointer"
                    >
                        <div className={`p-3 rounded-full border-4 border-[#001f3f] dark:border-[#0f172a] shadow-xl transition-all duration-300 ${
                            location.pathname === '/home' || location.pathname === '/'
                                ? "bg-gradient-to-tr from-[#1E88E5] to-[#00ACC1] text-white scale-110 shadow-blue-500/50"
                                : "bg-[#1565C0] text-blue-100 group-hover:scale-105"
                        }`}>
                            <HomeIcon sx={{ fontSize: "1.6rem" }} />
                        </div>
                        <span className={`text-[10px] font-bold mt-0.5 ${
                            location.pathname === '/home' || location.pathname === '/'
                                ? "text-sky-300 font-black"
                                : "text-blue-100/70"
                        }`}>
                            Home
                        </span>
                    </Link>

                    {/* 4. Contact Us */}
                    <Link
                        to="/contact-us"
                        className={`flex flex-col items-center justify-center w-14 py-1 text-xs font-semibold transition-all ${
                            location.pathname.startsWith('/contact-us')
                                ? "text-sky-300 font-bold scale-105"
                                : "text-blue-100/70 hover:text-white"
                        }`}
                    >
                        <CallIcon sx={{ fontSize: "1.35rem" }} />
                        <span className="text-[10px] mt-0.5 font-bold">Contact</span>
                    </Link>

                    {/* 5. Profile (Right-most) */}
                    <button
                        onClick={(e) => {
                            if (authAdmin || authUser) {
                                handleProfileMenuClick(e);
                            } else {
                                setOpenLoginDialog(true);
                            }
                        }}
                        className={`flex flex-col items-center justify-center w-14 py-1 text-xs font-semibold transition-all cursor-pointer ${
                            location.pathname.startsWith('/user-profile') || location.pathname.startsWith('/admin')
                                ? "text-sky-300 font-bold scale-105"
                                : "text-blue-100/70 hover:text-white"
                        }`}
                    >
                        {authUser ? (
                            <Avatar
                                alt={authUser?.firstName}
                                src={authUser?.photo}
                                sx={{ width: 24, height: 24, border: "1.5px solid #00ACC1" }}
                            />
                        ) : authAdmin ? (
                            <Avatar
                                alt={authAdmin?.name || "Admin"}
                                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                sx={{ width: 24, height: 24, border: "1.5px solid #00ACC1" }}
                            />
                        ) : (
                            <PersonIcon sx={{ fontSize: "1.35rem" }} />
                        )}
                        <span className="text-[10px] mt-0.5 font-bold">Profile</span>
                    </button>
                </nav>
            )}

            <Dialog
                open={notificationDialog}
                onClose={() => setNotificationDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                slots={{
                    transition: Transition,
                }}
                slotProps={{
                    paper: {
                        sx: {
                            position: 'absolute',
                            top: 75,
                            m: 0,
                            maxHeight: "300px",
                            backgroundColor: theme === "dark" ? "#0f0f0f" : "#ffffff",
                            right: {
                                xs: 30,
                                sm: 100,
                                md: 150
                            },
                            width: {
                                xs: '300px',
                                sm: '300px',
                                md: '350px'
                            }
                        },
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
                                {
                                    notificationLoadingIndex === "all" ? <div className="w-3 h-3 border-[2px] border-t-transparent border-gray-500 rounded-full animate-spin" /> : "Clear All"
                                }
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
                                    key={item?._id || item?.id || `notif-${idx}-${item?.title || ""}`}
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