import { useContext, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PropTypes from "prop-types";
import { useLocation, Navigate } from "react-router-dom";
import { ProductContext } from "../context/ProductProvider";
import { AdminAuthContext } from "../context/AuthProvider";

import PageTransition from "../components/PageTransition";
import FloatingCart from "../components/Common/FloatingCart";

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

    const isProductsCatalog = location.pathname === "/products";
    const isProductsPage = location.pathname === "/products" || location.pathname.startsWith("/products");
    const isProductDetailsPage = location.pathname.startsWith("/product-details") || location.pathname.includes("product-details");
    const isCartPage = location.pathname.includes("cart");
    const isCheckoutPage = location.pathname.includes("checkout");
    const isWishlistPage = location.pathname.includes("wishlist");
    const hideFooter = isProductsPage || isWishlistPage || isProductDetailsPage || isCheckoutPage || isCartPage;

    const isNoBottomNav = isProductDetailsPage || isCheckoutPage || isCartPage;

    return (
        <div ref={scrollRef} className="min-h-screen w-full max-w-full flex flex-col bg-fixed bg-cover bg-center text-black dark:text-white transition-colors duration-300 relative">
            <Navbar />
            <main className={`flex-1 min-h-[100dvh] flex flex-col w-full max-w-full ${
                (isProductsPage || isProductDetailsPage || isCartPage || isCheckoutPage)
                    ? 'pt-0 md:pt-[60px]'
                    : 'pt-[48px] sm:pt-[54px] md:pt-[60px]'
            } ${isNoBottomNav ? 'pb-6 lg:pb-0' : 'pb-[56px] sm:pb-[62px] lg:pb-0'}`}>
                <PageTransition key={location.pathname}>
                    {children}
                </PageTransition>
            </main>

            {/* Floating Cart Button (Strictly for Mobile App & Mobile Responsive Views) */}
            <FloatingCart />

            {/* Footer sits naturally at the bottom of page content — NEVER sticky or in initial fold */}
            {!hideFooter && <Footer />}
        </div>
    );
}

Layout.propTypes = {
    children: PropTypes.node
};
