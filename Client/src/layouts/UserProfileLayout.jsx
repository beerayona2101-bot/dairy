import React, { useContext, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import UserProfileSidebar from "../components/UserProfileSidebar";
import { UserAuthContext, AdminAuthContext } from "../context/AuthProvider";
import PropTypes from "prop-types";
import BuffaloLoader from "../components/BuffaloLoader";

export default function UserProfileLayout({ children }) {
    const scrollRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { authUser, authUserLoading } = useContext(UserAuthContext);
    const { authAdmin, authAdminLoading } = useContext(AdminAuthContext);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0 });
        }
    }, [location.pathname]);

    const activeUser = authUser || authAdmin;
    const isAnyUserInStorage = localStorage.getItem("User") || localStorage.getItem("Admin");

    if (authUserLoading || authAdminLoading) {
        return <BuffaloLoader variant="full" text="Loading your profile... Please wait." />;
    }

    if (!isAnyUserInStorage || !activeUser) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return (
        <div
            className="h-screen flex flex-col bg-[#F0F1F3] dark:bg-[#121212] text-black dark:text-white transition-colors duration-300 overflow-hidden"
        >
            <Navbar />

            <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col md:flex-row items-stretch pt-20 pb-4 sm:pb-6 px-3 sm:px-6 gap-6 min-w-0 overflow-hidden h-[calc(100vh-64px)]">
                <div className="hidden md:flex flex-col w-64 shrink-0 h-full overflow-hidden">
                    <UserProfileSidebar />
                </div>

                <div className="flex-1 w-full min-w-0 h-full rounded-[24px] shadow-sm bg-white dark:bg-gray-800/85 backdrop-blur-[16px] dark:text-white p-4 sm:p-6 transition-all duration-300 border border-white/90 dark:border-gray-700/80 flex flex-col overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}

UserProfileLayout.propTypes = {
    children: PropTypes.node
};