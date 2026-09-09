import { useNavigate, useParams } from "react-router-dom";
import CategoryIcon from '@mui/icons-material/Category';
import { slugify } from "../../utils/slugify";
import { useContext, useMemo, useEffect, useRef } from "react";
import { ProductContext } from "../../context/ProductProvider";
import { groupProductsByCategory } from "../../utils/groupProductsByCategory";
import { Skeleton } from "@mui/material";

export default function ProductList() {
    const { products, productLoading } = useContext(ProductContext);
    const navigate = useNavigate();
    const { productId } = useParams();

    const groupedProducts = useMemo(() => groupProductsByCategory(products), [products]);
    const cleanProductId = useMemo(() => productId ? productId.replace(/-/g, " ").toLowerCase().trim() : "", [productId]);

    const categoriesList = useMemo(() => {
        return Object.keys(groupedProducts);
    }, [groupedProducts]);

    const scrollContainerRef = useRef(null);
    const selectedItemRef = useRef(null);

    useEffect(() => {
        if (selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [productId]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Fixed Sidebar Header */}
            <div className="h-[42px] pb-3 mb-3 border-b-2 border-[#1E88E5]/20 dark:border-gray-700 flex justify-between items-center text-gray-800 dark:text-gray-100 flex-shrink-0">
                <h2 className="text-xl font-bold tracking-tight">Our Categories</h2>
                <CategoryIcon className="text-[#1E88E5] dark:text-pink-400" sx={{ fontSize: "1.4rem" }} />
            </div>

            {/* Scrollable Content inside Sidebar */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar overscroll-contain">
                {productLoading ? (
                    <ul className="space-y-2">
                        {[...Array(6)].map((_, index) => (
                            <li key={index * 0.598}>
                                <Skeleton
                                    variant="text"
                                    height={36}
                                    width="100%"
                                    animation="wave"
                                    sx={{ borderRadius: '8px' }}
                                    className="bg-gray-200 dark:bg-gray-800"
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="space-y-1">
                        <li key="all" ref={!productId ? selectedItemRef : null}>
                            <button
                                onClick={() => navigate("/products")}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-between min-w-0 cursor-pointer ${
                                    !productId
                                        ? "text-white bg-[#1E88E5] font-bold shadow-sm"
                                        : "text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-700/50"
                                }`}
                            >
                                <span className="truncate">All Products</span>
                            </button>
                        </li>

                        {categoriesList.map((category) => {
                            const catSlug = slugify(category);
                            const isSelected = Boolean(productId) && (
                                catSlug === productId ||
                                category.toLowerCase().trim() === cleanProductId
                            );

                            return (
                                <li key={category} ref={isSelected ? selectedItemRef : null}>
                                    <button
                                        onClick={() => navigate(`/products/${catSlug}`)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-between min-w-0 cursor-pointer ${
                                            isSelected
                                                ? "text-white bg-[#1E88E5] font-bold shadow-sm"
                                                : "text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-700/50"
                                        }`}
                                    >
                                        <span className="truncate">{category}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
