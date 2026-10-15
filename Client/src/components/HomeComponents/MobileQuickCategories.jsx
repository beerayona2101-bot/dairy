import { useContext } from "react";
import { Link } from "react-router-dom";
import { PageContentContext } from "../../context/PageContentProvider";
import { products as baseProducts } from "../../data/products";
import { slugify } from "../../utils/slugify";

const CATEGORY_EMOJIS = {
    milk: "🥛", paneer: "🧀", ghee: "🫙", curd: "🍶",
    butter: "🧈", lassi: "🥤", chaas: "🥤", sweets: "🍮",
    khoya: "🍯", cream: "🍦", cheese: "🧀", powder: "🥛",
};
function getCategoryEmoji(title) {
    const lower = (title || "").toLowerCase();
    for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
        if (lower.includes(key)) return emoji;
    }
    return "🥛";
}

export default function MobileQuickCategories() {
    const { pageContent } = useContext(PageContentContext);

    const cardMap = new Map();
    baseProducts.forEach((p) => {
        const title = p.title || p.name;
        if (title) cardMap.set(title.toLowerCase().trim(), { title });
    });
    if (Array.isArray(pageContent?.homeCategoryCards)) {
        pageContent.homeCategoryCards.forEach((c) => {
            const title = c?.title || c?.name;
            if (title) cardMap.set(title.toLowerCase().trim(), { title });
        });
    }
    const categories = Array.from(cardMap.values()).slice(0, 10);

    return (
        <section className="md:hidden w-full bg-white pt-5 pb-3">
            {/* Header */}
            <div className="px-4 mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800">Shop by Category</h2>
                <Link to="/products" className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
                    See All →
                </Link>
            </div>

            {/* Horizontal Scroll */}
            <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar">
                {categories.map((cat, idx) => (
                    <Link
                        key={`cat-${idx}`}
                        to={`/products/${slugify(cat.title)}`}
                        className="shrink-0 flex flex-col items-center gap-1.5"
                    >
                        {/* Circle */}
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <span className="text-2xl">{getCategoryEmoji(cat.title)}</span>
                        </div>
                        {/* Label */}
                        <span className="text-[10px] text-gray-600 font-medium text-center w-14 truncate">
                            {cat.title}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
