import { useContext } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { products } from "../../data/products";
import { slugify } from "../../utils/slugify";
import { getCardBackgroundImage } from "../../utils/helper";
import { PageContentContext } from "../../context/PageContentProvider";

export default function DairyProductsCarousel({ half }) {
    const pageContentCtx = useContext(PageContentContext) || {};
    const cardMap = new Map();
    products.forEach((p) => {
        const title = p.title || p.name;
        if (title) {
            cardMap.set(title.toLowerCase().trim(), { title, image: getCardBackgroundImage(p) });
        }
    });
    const homeCards = pageContentCtx.pageContent?.homeCategoryCards;

    if (Array.isArray(homeCards)) {
        homeCards.forEach((c) => {
            const title = c?.title || c?.name;
            if (title) {
                const key = title.toLowerCase().trim();
                cardMap.set(key, { title, image: getCardBackgroundImage(c, title) });
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
                const imgUrl = getCardBackgroundImage({ name: title, image: item?.image }, title);
                return (
                    <Link
                        key={`carousel-${half}-${index}-${slugify(title)}`}
                        to={`/products/${slugify(title)}`}
                        className="mx-3 sm:mx-5 text-center group/item py-2 shrink-0"
                    >
                        {/* Pristine Circular Category Orb Container */}
                        <div className="h-24 w-24 sm:h-32 sm:w-32 mx-auto rounded-full overflow-hidden relative shadow-xs hover:shadow-md group-hover/item:scale-105 transition-all duration-300 border-2 border-white/80 dark:border-gray-700/80 ring-1 ring-black/5 dark:ring-white/10 bg-gray-100 dark:bg-gray-800">
                            {/* 4K Vivid Image with High Clarity & Contrast */}
                            <img
                                src={imgUrl}
                                alt={title}
                                className="w-full h-full object-cover rounded-full brightness-105 contrast-105 saturate-105 transition-all duration-300 transform-gpu"
                            />

                            {/* Gentle, subtle gradient overlay for text readability without washing out the image */}
                            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white/65 via-white/20 to-transparent pointer-events-none rounded-b-full" />

                            {/* Category Name INSIDE Circle at Bottom */}
                            <div className="absolute bottom-1.5 sm:bottom-2.5 inset-x-0 px-1 flex items-center justify-center pointer-events-none z-10">
                                <span className="text-xs sm:text-sm font-black text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] tracking-tight group-hover/item:text-[#134E24] transition-colors duration-300 truncate max-w-full">
                                    {title}
                                </span>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

DairyProductsCarousel.propTypes = {
    half: PropTypes.string.isRequired
};
