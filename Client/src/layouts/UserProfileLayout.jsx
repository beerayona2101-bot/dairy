import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import UserProfileSidebar from "../components/UserProfileSidebar";
import { UserAuthContext, AdminAuthContext } from "../context/AuthProvider";
import PropTypes from "prop-types";
import BuffaloLoader from "../components/BuffaloLoader";
import PageTransition from "../components/PageTransition";
import { Menu, X, User, ShoppingBag, MapPin, Heart, CreditCard, ChevronRight, Info, Headphones, ArrowLeft } from "lucide-react";
import { Drawer } from "@mui/material";
import BackButton from "../components/Common/BackButton";

export default function UserProfileLayout({ children }) {
    const scrollRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { authUser, authUserLoading } = useContext(UserAuthContext);
    const { authAdmin, authAdminLoading } = useContext(AdminAuthContext);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0 });
        }
    }, [location.pathname]);

    const userToken = sessionStorage.getItem("userToken");
    const userRole = sessionStorage.getItem("userRole");

    const mobileNavTabs = [
        { key: "/user-profile", label: "My Profile", icon: <User size={14} /> },
        { key: "/user-profile/orders", label: "My Orders", icon: <ShoppingBag size={14} /> },
        { key: "/user-profile/addresses", label: "Saved Addresses", icon: <MapPin size={14} /> },
        { key: "/user-profile/wishlist", label: "My Wishlist", icon: <Heart size={14} /> },
        { key: "/user-profile/payments", label: "Payments", icon: <CreditCard size={14} /> },
        { key: "/about", label: "About Us", icon: <Info size={14} /> },
        { key: "/contact-us", label: "Contact Us", icon: <Headphones size={14} /> },
    ];

    const isSubProfilePage = location.pathname !== "/user-profile" && location.pathname.startsWith("/user-profile/");
    const currentTabLabel = mobileNavTabs.find(tab => tab.key === location.pathname)?.label || "Profile Options";

    if (authUserLoading) {
        return <BuffaloLoader variant="full" text="Loading your profile... Please wait." />;
    }

    if (!authUser || !userToken || userRole !== "user") {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return (
        <div
            className="h-screen flex flex-col bg-fixed bg-cover bg-center text-black dark:text-white transition-colors duration-300 overflow-hidden relative"
        >
            <Navbar />

            <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col md:flex-row items-stretch pt-13 sm:pt-24 md:pt-22 pb-16 sm:pb-6 px-0 sm:px-6 gap-6 min-w-0 overflow-hidden h-full">
                {/* Desktop Sidebar (hidden on mobile) */}
                <div className="hidden md:flex flex-col w-64 shrink-0 h-full overflow-hidden">
                    <UserProfileSidebar />
                </div>

                {/* Main Content Glass Card (Full Width Transparent on Mobile, Rounded Card on Desktop) */}
                <div className="flex-1 w-full min-w-0 h-full rounded-none md:rounded-[24px] shadow-none md:shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-transparent md:bg-white dark:md:bg-slate-900 backdrop-blur-none md:backdrop-blur-2xl dark:text-white px-3.5 sm:px-6 pt-1 sm:pt-6 pb-3.5 sm:pb-6 transition-all duration-300 border-0 md:border border-gray-200/90 dark:border-gray-800 flex flex-col overflow-hidden">
                    
                    {/* Mobile Navigation Header with Back Arrow Only (Mobile Only - Only shown when inside sub-options) */}
                    {isSubProfilePage && !location.pathname.includes("wishlist") && (
                        <div className="md:hidden flex items-center justify-start pb-2 mb-2 border-b border-gray-200/80 dark:border-gray-800 shrink-0">
                            <BackButton fallbackPath="/user-profile" />
                        </div>
                    )}

                    {/* Page Content */}
                    <PageTransition key={location.pathname} className="h-full flex flex-col min-h-0 flex-1">
                        {children}
                    </PageTransition>
                </div>
            </main>

            {/* Mobile Sidebar Slide Drawer */}
            <Drawer
                anchor="left"
                open={mobileDrawerOpen}
                onClose={() => setMobileDrawerOpen(false)}
                slotProps={{
                    paper: {
                        className: "!bg-transparent !p-0 !m-0 !w-[280px] sm:!w-[320px] !shadow-2xl !rounded-l-none !rounded-r-[24px] !border-l-0",
                    },
                    backdrop: {
                        className: "!bg-black/60 !backdrop-blur-xs",
                    },
                }}
            >
                <div className="h-full relative rounded-l-none rounded-r-[24px] overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-red-50 hover:text-red-500 transition cursor-pointer shadow-xs"
                    >
                        <X size={18} />
                    </button>
                    <UserProfileSidebar
                        userProfileDrawer={mobileDrawerOpen}
                        setUserProfileDrawer={setMobileDrawerOpen}
                    />
                </div>
            </Drawer>
        </div>
    );
}

UserProfileLayout.propTypes = {
    children: PropTypes.node
};
