import React, { useContext, useEffect, useRef } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import UserProfileSidebar from "../components/UserProfileSidebar";
import { UserAuthContext } from "../context/AuthProvider";
import PropTypes from "prop-types";
import BuffaloLoader from "../components/BuffaloLoader";
import PageTransition from "../components/PageTransition";
import BackButton from "../components/Common/BackButton";

export default function UserProfileLayout({ children }) {
    const scrollRef = useRef(null);
    const location = useLocation();
    const { authUser, authUserLoading } = useContext(UserAuthContext);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0 });
        }
    }, [location.pathname]);

    const userToken = sessionStorage.getItem("userToken") || localStorage.getItem("userToken");
    const userRole = sessionStorage.getItem("userRole") || localStorage.getItem("userRole");

    const isSubProfilePage = location.pathname !== "/user-profile" && location.pathname.startsWith("/user-profile/");

    const getSubProfileTitle = (path) => {
        if (path.includes("/dashboard")) return "Dashboard Overview";
        if (path.includes("/orders")) return "My Orders";
        if (path.includes("/addresses")) return "Saved Addresses";
        if (path.includes("/payments")) return "Payment Methods";
        if (path.includes("/wishlist")) return "My Wishlist";
        return "Account";
    };

    if (authUserLoading) {
        return <BuffaloLoader variant="full" text="Loading your profile... Please wait." />;
    }

    if (!authUser || !userToken || userRole !== "user") {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return (
        <div
            className="h-screen flex flex-col bg-fixed bg-cover bg-center text-black dark:text-white transition-colors duration-300 overflow-hidden relative font-dashboard select-normal"
        >
            <Navbar />

            <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col md:flex-row items-stretch pt-13 sm:pt-24 md:pt-22 pb-16 sm:pb-6 px-0 sm:px-6 gap-6 min-w-0 overflow-hidden h-full">
                {/* Desktop Sidebar (hidden on mobile) */}
                <div className="hidden md:flex flex-col w-64 shrink-0 h-full overflow-hidden">
                    <UserProfileSidebar />
                </div>

                {/* Main Content Glass Card (Full Width Transparent on Mobile, Rounded Card on Desktop) */}
                <div className="flex-1 w-full min-w-0 h-full rounded-none md:rounded-[24px] shadow-none md:shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-transparent md:bg-white dark:md:bg-slate-900 backdrop-blur-none md:backdrop-blur-2xl dark:text-white px-3.5 sm:px-6 pt-1 sm:pt-6 pb-3.5 sm:pb-6 transition-all duration-300 border-0 md:border border-gray-200/90 dark:border-gray-800 flex flex-col overflow-hidden">
                    
                    {/* Mobile Navigation Header (Shown when inside sub-options on mobile) */}
                    {isSubProfilePage && !location.pathname.includes("wishlist") && (
                        <div className="md:hidden flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-200/80 dark:border-gray-800 shrink-0">
                            <div className="flex items-center gap-2">
                                <BackButton fallbackPath="/user-profile" />
                                <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                                    {getSubProfileTitle(location.pathname)}
                                </h2>
                            </div>
                            <Link
                                to="/user-profile"
                                className="text-[11px] font-extrabold text-[#075C2A] dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100 transition-colors"
                            >
                                Profile Menu
                            </Link>
                        </div>
                    )}

                    {/* Page Content */}
                    <PageTransition key={location.pathname} className="h-full flex flex-col min-h-0 flex-1">
                        {children}
                    </PageTransition>
                </div>
            </main>
        </div>
    );
}

UserProfileLayout.propTypes = {
    children: PropTypes.node
};
