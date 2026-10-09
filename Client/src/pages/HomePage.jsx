import { useContext, useMemo } from "react";
import { PageContentContext } from "../context/PageContentProvider";
import { ProductContext } from "../context/ProductProvider";
import { faqs as defaultFaqs } from "../data/products";
import ScrollReveal from "../components/Common/ScrollReveal";

// Modular Homepage Components
import HomeWelcomeHero from "../components/HomeComponents/HomeWelcomeHero";
import FeaturedProductsSection from "../components/HomeComponents/FeaturedProductsSection";
import ProductCategoriesGrid from "../components/HomeComponents/ProductCategoriesGrid";
import AboutBrandPreview from "../components/HomeComponents/AboutBrandPreview";
import WhyChooseUsSection from "../components/HomeComponents/WhyChooseUsSection";
import FarmToTableSection from "../components/HomeComponents/FarmToTableSection";
import CustomerTrustSection from "../components/HomeComponents/CustomerTrustSection";
import HomeFaqSection from "../components/HomeComponents/HomeFaqSection";
import HomeContactCta from "../components/HomeComponents/HomeContactCta";

export default function HomePage() {
    const { pageContent } = useContext(PageContentContext);
    const { products: liveProducts } = useContext(ProductContext);

    // FAQs fallback
    const displayFaqs = useMemo(() => {
        return pageContent?.faqs?.length > 0 ? pageContent.faqs : defaultFaqs;
    }, [pageContent]);

    return (
        <div className="bg-[#FAFBFD] dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
            {/* 1. HERO CAROUSEL: Full-width 100% Viewport on Web, Responsive Card on Mobile */}
            <div className="w-full max-w-7xl md:max-w-none mx-auto px-3 sm:px-6 md:px-0 pt-2 pb-3 md:pt-0 md:pb-0">
                <HomeWelcomeHero />
            </div>

            {/* Main Content Sections with Spacious, Elegant Layout */}
            <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 sm:space-y-18">

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

                {/* 9. FAQ ACCORDION */}
                <ScrollReveal yOffset={30} duration={0.65}>
                    <HomeFaqSection faqs={displayFaqs} />
                </ScrollReveal>

                {/* 10. CONTACT / DELIVERY CTA ("Freshness Delivered to Your Door Every Morning") */}
                <ScrollReveal yOffset={30} duration={0.65}>
                    <HomeContactCta />
                </ScrollReveal>

            </div>
        </div>
    );
}
