import { useContext, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Sidebar from "../components/AdminComponents/Sidebar";
import { useLocation, Link, Navigate } from "react-router-dom";
import { SidebarProvider } from "../context/SidebarProvider";
import AdminNavbar from "../components/AdminComponents/AdminNavbar";
import { AdminAuthContext } from "../context/AuthProvider";
import AdminOrderProvider from "../context/AdminOrderProvider";
import BuffaloLoader from "../components/BuffaloLoader";

import PageTransition from "../components/PageTransition";

export default function AdminLayout({ children }) {

    const scrollRef = useRef(null);
    const location = useLocation();

    const { authAdmin, authAdminLoading } = useContext(AdminAuthContext);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0 });
        }
    }, [location.pathname]);

    const adminToken = sessionStorage.getItem("adminToken");
    const adminRole = sessionStorage.getItem("adminRole");

    if (authAdminLoading) {
        return <BuffaloLoader variant="full" text="Loading admin details..." />;
    }

    if (!authAdmin || !adminToken || adminRole !== "admin") {
        return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }

    return (
        <AdminOrderProvider>
            <SidebarProvider>
                <div ref={scrollRef} className="h-screen scroll-smooth flex overflow-hidden bg-fixed bg-cover bg-center text-[#2D3748] dark:text-white transition-colors duration-300 relative">
                    <Sidebar />
                    <main className="flex-1 h-full overflow-y-auto overflow-x-hidden flex flex-col">
                        <AdminNavbar />
                        <PageTransition key={location.pathname}>
                            {children}
                        </PageTransition>
                    </main>
                </div>
            </SidebarProvider>
        </AdminOrderProvider>
    )
}

AdminLayout.propTypes = {
    children: PropTypes.node
};
