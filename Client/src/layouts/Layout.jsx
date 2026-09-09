import { useContext, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { ProductContext } from "../context/ProductProvider";

import PageTransition from "../components/PageTransition";

export default function Layout({ children }) {

    const scrollRef = useRef(null);
    const location = useLocation();

    const { setShowHeaderExtras } = useContext(ProductContext);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0 });
        }
    }, [location.pathname]);



    const isProductsPage = location.pathname === "/products" || location.pathname.startsWith("/products");
    const isCartPage = location.pathname.includes("cart");
    const isCheckoutPage = location.pathname.includes("checkout");
    const hideFooter = isProductsPage || location.pathname.startsWith("/product-details") || location.pathname.includes("product-details") || location.pathname.includes("checkout") || location.pathname.includes("cart");
    const hideNavbar = (location.pathname.startsWith("/products/") && location.pathname !== "/products") || location.pathname.startsWith("/product-details");

    return (
        <div ref={scrollRef} className="h-screen scroll-smooth flex flex-col overflow-y-auto overflow-x-hidden bg-fixed bg-cover bg-center text-black dark:text-white transition-colors duration-300 relative">
            {!hideNavbar && <Navbar />}
            <main className={`flex-1 flex flex-col ${(isProductsPage || isCartPage || isCheckoutPage) ? 'pt-0 md:pt-[54px]' : hideNavbar ? 'pt-0' : 'pt-[48px] sm:pt-[52px] md:pt-[54px]'} ${hideFooter ? 'pb-0' : 'pb-16 lg:pb-0'}`}>
                <PageTransition key={location.pathname}>
                    {children}
                </PageTransition>
            </main>
            {!hideFooter && <Footer />}
        </div>
    )
}

Layout.propTypes = {
    children: PropTypes.node
};
