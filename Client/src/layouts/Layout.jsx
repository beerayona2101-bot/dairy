import { useContext, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PropTypes from "prop-types";
import { useLocation, Navigate } from "react-router-dom";
import { ProductContext } from "../context/ProductProvider";
import { AdminAuthContext } from "../context/AuthProvider";

import PageTransition from "../components/PageTransition";

export default function Layout({ children }) {

    const scrollRef = useRef(null);
    const location = useLocation();

    const { setShowHeaderExtras } = useContext(ProductContext);
    const { authAdmin, authAdminLoading } = useContext(AdminAuthContext);
    const adminToken = sessionStorage.getItem("adminToken");
    const adminRole = sessionStorage.getItem("adminRole");

    const isValidAdmin = Boolean(authAdmin || (adminToken && adminRole === "admin"));

    useEffect(() => {
        window.scrollTo(0, 0);
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0 });
        }
    }, [location.pathname]);

    if (isValidAdmin && !authAdminLoading) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const isProductsPage = location.pathname === "/products" || location.pathname.startsWith("/products");
    const isCartPage = location.pathname.includes("cart");
    const isCheckoutPage = location.pathname.includes("checkout");
    const hideFooter = isProductsPage || location.pathname.startsWith("/product-details") || location.pathname.includes("product-details") || location.pathname.includes("checkout") || location.pathname.includes("cart");
    const hideNavbar = (location.pathname.startsWith("/products/") && location.pathname !== "/products") || location.pathname.startsWith("/product-details");

    return (
        <div ref={scrollRef} className="min-h-screen w-full max-w-full flex flex-col bg-fixed bg-cover bg-center text-black dark:text-white transition-colors duration-300 relative">
            {!hideNavbar && <Navbar />}
            <main className={`flex-1 min-h-[100dvh] flex flex-col w-full max-w-full overflow-x-clip ${hideNavbar ? 'pt-0' : (isProductsPage || isCartPage || isCheckoutPage) ? 'pt-0 md:pt-[56px]' : 'pt-[48px] sm:pt-[52px] md:pt-[56px]'} ${hideFooter ? 'pb-20 lg:pb-0' : ''}`}>
                <PageTransition key={location.pathname}>
                    {children}
                </PageTransition>
            </main>

            {/* Footer sits naturally at the bottom of page content — NEVER sticky or in initial fold */}
            {!hideFooter && <Footer />}

            {/* Transparent spacer: clears the fixed mobile bottom nav bar (64px + safe-area) */}
            <div
                className="lg:hidden shrink-0 w-full"
                style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
                aria-hidden="true"
            />
        </div>
    );
}

Layout.propTypes = {
    children: PropTypes.node
};
