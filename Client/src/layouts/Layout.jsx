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



    const hideFooter = location.pathname.startsWith("/products") || location.pathname.startsWith("/product-details") || location.pathname.includes("product-details");

    return (
        <div ref={scrollRef} className="h-screen scroll-smooth flex flex-col overflow-y-auto overflow-x-hidden bg-[#F0F1F3] dark:bg-[#121212] text-black dark:text-white transition-colors duration-300">
            <Navbar />
            <main className={`flex-1 flex flex-col ${hideFooter ? 'pb-0' : 'pb-16 lg:pb-0'}`}>
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