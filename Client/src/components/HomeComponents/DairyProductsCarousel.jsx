import { useContext } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { products } from "../../data/products";
import { slugify } from "../../utils/slugify";
import { getProductImage } from "../../utils/helper";
import { PageContentContext } from "../../context/PageContentProvider";

export default function DairyProductsCarousel({ half }) {
    const pageContentCtx = useContext(PageContentContext) || {};
    const cardMap = new Map();
    products.forEach((p) => {
        const title = p.title || p.name;
        if (title) {
            cardMap.set(title.toLowerCase().trim(), { title, image: p.image || getProductImage(p) });
        }
    });
    const homeCards = pageContentCtx.pageContent?.homeCategoryCards;

    if (Array.isArray(homeCards)) {
        homeCards.forEach((c) => {
            const title = c?.title || c?.name;
            if (title) {
                const key = title.toLowerCase().trim();
                cardMap.set(key, { title, image: c.image || cardMap.get(key)?.image || getProductImage(c) });
            }
        });
    }

    const sourceItems = Array.from(cardMap.values());
    const mid = Math.ceil(sourceItems.length / 2);
    const displayedItems = half === "first" ? sourceItems.slice(0, mid) : sourceItems.slice(mid);

    return (
        <div className="flex">
            {displayedItems?.map((item, index) => {
                const title = item?.title || item?.name || "Item";
                const imgUrl = item?.image || getProductImage({ name: title, image: item?.image });
                return (
                    <Link
                        key={`carousel-${half}-${index}-${slugify(title)}`}
                        to={`/products/${slugify(title)}`}
                        className="mx-3 sm:mx-6 text-center min-w-[120px] sm:min-w-[150px] group/item py-2"
                    >
                        {/* 3D Glass Sphere Orb Container */}
                        <div className="h-20 w-20 sm:h-28 sm:w-28 mx-auto rounded-full overflow-hidden relative shadow-[0_14px_30px_rgba(0,0,0,0.18),inset_0_-6px_12px_rgba(0,0,0,0.35),inset_0_3px_8px_rgba(255,255,255,0.7)] group-hover/item:shadow-[0_22px_45px_rgba(30,136,229,0.38),inset_0_-6px_14px_rgba(0,0,0,0.4),inset_0_4px_10px_rgba(255,255,255,0.9)] group-hover/item:scale-105 transition-all duration-300 flex-shrink-0 border border-white/30 dark:border-white/10">
                            {/* Image with 3D Depth Zoom */}
                            <img
                                src={imgUrl}
                                alt={title}
                                className="w-full h-full object-cover group-hover/item:scale-110 group-hover/item:brightness-105 transition-transform duration-500 transform-gpu"
                            />

                            {/* 1. Curved Top Glass Dome Highlight */}
                            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-t-full pointer-events-none" />

                            {/* 2. Diagonally Sweeping Glass Reflection Lens Flare */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-white/40 pointer-events-none rounded-full" />

                            {/* 3. Outer Glass Rim Ring Glow */}
                            <div className="absolute inset-0 rounded-full border-2 border-white/20 dark:border-white/10 pointer-events-none" />
                        </div>

                        <p className="mt-2.5 text-xs sm:text-sm font-bold text-gray-800 dark:text-white group-hover/item:text-[#1E88E5] dark:group-hover/item:text-blue-300 transition-colors">
                            {title}
                        </p>
                    </Link>
                );
            })}
        </div>
    );
}

DairyProductsCarousel.propTypes = {
    half: PropTypes.string.isRequired
};