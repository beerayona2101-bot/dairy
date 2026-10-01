import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ProductContext } from "../../context/ProductProvider";
import { CartContext } from "../../context/CartProvider";
import { getProductImage, getDiscountedPrice } from "../../utils/helper";
import { formatNumberWithCommas } from "../../utils/format";
import { useSnackbar } from "notistack";

export default function MobileFeaturedProducts() {
    const { enqueueSnackbar } = useSnackbar();
    const { products } = useContext(ProductContext);
    const { addToCart } = useContext(CartContext);
    const [addedIds, setAddedIds] = useState(new Set());

    const featuredProducts = (products || []).slice(0, 8);
    if (featuredProducts.length === 0) return null;

    const handleAddToCart = (product) => {
        if (!product?._id) return;
        const rawPrice = Number(product.price) || 0;
        const rawDiscount = Number(product.discount) || 0;
        const { discountedPrice } = getDiscountedPrice(rawPrice, rawDiscount);
        const finalPrice = discountedPrice > 0 ? discountedPrice : rawPrice;
        addToCart(product._id, 1, finalPrice);
        enqueueSnackbar(`${product.name || "Product"} added!`, { variant: "success" });
        setAddedIds((prev) => new Set([...prev, String(product._id)]));
        setTimeout(() => {
            setAddedIds((prev) => { const n = new Set(prev); n.delete(String(product._id)); return n; });
        }, 1800);
    };

    return (
        <section className="md:hidden w-full bg-white pt-5 pb-3">
            {/* Header */}
            <div className="px-4 mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800">Featured Products</h2>
                <Link to="/products" className="text-xs text-violet-600 font-semibold">
                    View All →
                </Link>
            </div>

            {/* Horizontal Scroll */}
            <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
                {featuredProducts.map((product, idx) => {
                    const rawPrice = Number(product?.price) || 0;
                    const rawDiscount = Number(product?.discount) || 0;
                    const { discountedPrice } = getDiscountedPrice(rawPrice, rawDiscount);
                    const finalPrice = discountedPrice > 0 ? discountedPrice : rawPrice;
                    const isAdded = addedIds.has(String(product._id));

                    return (
                        <div
                            key={`fp-${idx}`}
                            className="shrink-0 w-44 rounded-xl border border-gray-100 bg-white overflow-hidden flex flex-col"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
                        >
                            {/* Image */}
                            <div className="relative h-40 bg-gray-50">
                                <img
                                    src={getProductImage(product)}
                                    alt={product?.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                                {rawDiscount > 0 && (
                                    <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                        -{rawDiscount}%
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-2 flex flex-col gap-1.5 flex-1">
                                <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight">
                                    {product?.name}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[12px] font-bold text-gray-900">
                                        ₹{formatNumberWithCommas(finalPrice)}
                                    </span>
                                    {rawDiscount > 0 && (
                                        <span className="text-[9px] text-gray-400 line-through">
                                            ₹{formatNumberWithCommas(rawPrice)}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                        isAdded
                                            ? "bg-green-500 text-white"
                                            : "bg-violet-600 text-white"
                                    }`}
                                >
                                    {isAdded ? "✓ Added" : "+ Add"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
