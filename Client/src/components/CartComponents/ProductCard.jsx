import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { CartContext } from "../../context/CartProvider";
import { Link } from "react-router-dom";
import { slugify } from "../../utils/slugify";
import { getDiscountedPrice, getProductImage } from "../../utils/helper";
import { formatNumberWithCommas } from "../../utils/format";


export default function ProductCard({ item, highlightOutOfStock }) {

    const { id, name, image, price, selectedQuantity, quantityUnit, type, stock, discount } = item;
    const { removeFromCart, updateCartItem } = useContext(CartContext);

    const [newQty, setNewQty] = useState(selectedQuantity || 0);

    useEffect(() => {
        setNewQty(selectedQuantity || 0);
    }, [id, selectedQuantity]);

    const handleQuantityChange = (e) => {
        const currQty = Number(e.target.value);
        setNewQty(currQty);
        if (currQty !== selectedQuantity && currQty > 0 && currQty <= stock) {
            updateCartItem(id, currQty);
        }
    }

    const handleUpdateQuantity = (currQty) => {

        if (currQty <= 0) {
            removeFromCart(id);
            return;
        }

        setNewQty(currQty);

        if (currQty !== selectedQuantity && currQty > 0 && currQty <= stock) {
            updateCartItem(id, currQty);
        }
    }

    const { discountedPrice } = getDiscountedPrice(price, discount);
    const itemTotalPrice = discountedPrice * newQty;
    const itemOriginalPrice = price * newQty;
    const isOutOfStock = stock < newQty;

    return (
        <div className={`w-full py-2.5 px-1 sm:p-4 flex items-center justify-between gap-3 transition-all duration-200 md:bg-white/95 md:dark:bg-gray-800/95 md:backdrop-blur-md md:border md:border-gray-100 md:dark:border-gray-700/80 md:shadow-xs md:hover:shadow-md md:rounded-2xl ${isOutOfStock && "opacity-60"} ${highlightOutOfStock && "ring-2 ring-red-500 !bg-red-500/10 animate-pulse"}`}>
            {/* Left Section: Product Thumbnail + Info (Title & Subtitle) */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Product Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700/60 flex items-center justify-center p-1 group">
                    <img
                        src={getProductImage({ name, image })}
                        alt={name}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Product Title & Subtitle */}
                <div className="min-w-0 space-y-0.5">
                    <Link
                        to={`/product-details/${slugify(name)}`}
                        className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-1 hover:text-[#6C5CE7] transition-colors leading-tight"
                        title={name}
                    >
                        {name}
                    </Link>
                    <p className="text-xs text-gray-400 dark:text-gray-400 font-medium">
                        {quantityUnit ? `1 ${quantityUnit}` : '1 Unit'} ({type || 'Regular'})
                    </p>
                    {isOutOfStock && (
                        <p className="text-[11px] text-red-600 font-bold">
                            Only {stock} left in stock.
                        </p>
                    )}
                </div>
            </div>

            {/* Right Section: Quantity Stepper Pill & Price Details */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                {/* Quantity Pill Box [ − 3 + ] */}
                <div className="bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 rounded-xl px-2.5 py-1 flex items-center gap-2.5 text-[#6C5CE7] dark:text-[#A78BFA] font-black text-xs sm:text-sm shadow-2xs">
                    <button
                        type="button"
                        onClick={() => handleUpdateQuantity(newQty - 1)}
                        className="w-5 h-5 flex items-center justify-center text-purple-700 dark:text-purple-300 hover:text-red-600 active:scale-90 transition cursor-pointer"
                        title="Decrease quantity or remove"
                    >
                        <RemoveIcon sx={{ fontSize: "1rem" }} />
                    </button>

                    <span className="min-w-[14px] text-center font-extrabold text-gray-900 dark:text-white">
                        {newQty}
                    </span>

                    <button
                        type="button"
                        disabled={newQty >= stock}
                        onClick={() => handleUpdateQuantity(newQty + 1)}
                        className="w-5 h-5 flex items-center justify-center text-purple-700 dark:text-purple-300 hover:text-emerald-600 disabled:opacity-30 active:scale-90 transition cursor-pointer"
                        title="Increase quantity"
                    >
                        <AddIcon sx={{ fontSize: "1rem" }} />
                    </button>
                </div>

                {/* Price Display */}
                <div className="flex items-center gap-1.5 text-right">
                    {discount > 0 && (
                        <span className="text-xs line-through text-gray-400 font-semibold">
                            &#8377;{formatNumberWithCommas(itemOriginalPrice)}
                        </span>
                    )}
                    <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                        &#8377;{formatNumberWithCommas(itemTotalPrice)}
                    </span>
                </div>
            </div>
        </div>
    );
}

ProductCard.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        image: PropTypes.string,
        price: PropTypes.number.isRequired,
        selectedQuantity: PropTypes.number.isRequired,
        quantityUnit: PropTypes.string,
        type: PropTypes.string,
        stock: PropTypes.number.isRequired,
        discount: PropTypes.number.isRequired,
    }).isRequired,
    highlightOutOfStock: PropTypes.bool.isRequired,
};    
