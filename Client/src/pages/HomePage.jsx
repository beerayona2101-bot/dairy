import { useContext } from "react";
import { PageContentContext } from "../context/PageContentProvider";
import { ProductContext } from "../context/ProductProvider";
import ScrollReveal from "../components/Common/ScrollReveal";

// Modular Homepage Components
import MobileWelcomeBanner from "../components/HomeComponents/MobileWelcomeBanner";
import HomeWelcomeHero from "../components/HomeComponents/HomeWelcomeHero";
import FeaturedProductsSection from "../components/HomeComponents/FeaturedProductsSection";
import ProductCategoriesGrid from "../components/HomeComponents/ProductCategoriesGrid";
import AboutBrandPreview from "../components/HomeComponents/AboutBrandPreview";
import WhyChooseUsSection from "../components/HomeComponents/WhyChooseUsSection";
import FarmToTableSection from "../components/HomeComponents/FarmToTableSection";
import CustomerTrustSection from "../components/HomeComponents/CustomerTrustSection";
import HomeContactCta from "../components/HomeComponents/HomeContactCta";

export default function HomePage() {
    const { pageContent } = useContext(PageContentContext);
    const { products: liveProducts } = useContext(ProductContext);

    return (
        <div className="bg-[#FAFBFD] dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
            {/* 1. WELCOME NOTE BANNER (Mobile Viewports): Positioned at the top of carousels */}
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-1.5 pb-1 md:hidden">
                <MobileWelcomeBanner />
            </div>

            {/* 2. HERO CAROUSEL: Rectangular shape from left to right */}
            <div className="w-full max-w-7xl md:max-w-none mx-auto px-3 sm:px-6 md:px-0 pt-0.5 pb-2 md:pt-0 md:pb-0">
                <HomeWelcomeHero />
            </div>

            {/* Main Content Sections with Compact, Elegant Mobile Layout */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-8 space-y-5 sm:space-y-12">

                {/* 1. FEATURED PRODUCTS (Handpicked Farm Favourites with Instant Cart) */}
                <ScrollReveal yOffset={30} duration={0.65}>
                    <FeaturedProductsSection products={liveProducts} />
                </ScrollReveal>

                {/* 4. PRODUCT CATEGORIES (Visual Cards Grid for Milk, Paneer, Ghee, Curd, etc.) */}
                <ScrollReveal yOffset={30} duration={0.65}>
                    <ProductCategoriesGrid pageContent={pageContent} liveProducts={liveProducts} />
                </ScrollReveal>

                {/* 5. ABOUT THE BRAND (Compact About Us Preview with 4 Core Stats & Brand Story) */}
                <ScrollReveal yOffset={30} duration={0.65}>
                    <AboutBrandPreview />
                </ScrollReveal>

                {/* 6. WHY CHOOSE US (6 Benefits: Freshness, Ethical Sourcing, 4°C Cold Chain, etc.) */}
                <ScrollReveal yOffset={30} duration={0.65}>
                    <WhyChooseUsSection />
                </ScrollReveal>

                {/* 7. VISUAL PRODUCT / FARM-TO-TABLE FRESHNESS JOURNEY */}
                <ScrollReveal yOffset={30} duration={0.65}>
                    <FarmToTableSection />
                </ScrollReveal>

                {/* 8. CUSTOMER / TRUST SECTION (4.9 Rating, Verified Reviews, Certifications) */}
                <ScrollReveal yOffset={30} duration={0.65}>
                    <CustomerTrustSection />
                </ScrollReveal>


                {/* 10. CONTACT / DELIVERY CTA ("Freshness Delivered to Your Door Every Morning") */}
                <ScrollReveal yOffset={30} duration={0.65}>
                    <HomeContactCta />
                </ScrollReveal>

            </div>
        </div>
    );
}
