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

    const { discountedPrice, saved } = getDiscountedPrice(price, discount);
    const itemTotal = discountedPrice * selectedQuantity;
    const totalSaved = saved * selectedQuantity;
    const isOutOfStock = stock < newQty;

    return (
        <div className={`w-full rounded-lg p-2 flex items-center gap-4 transition relative dark:bg-gray-500/20 bg-white ${isOutOfStock && "opacity-60"}  ${highlightOutOfStock && "ring-1 ring-red-500 !bg-red-500/10 animate-pulse"}`}>
            <div className="h-22 w-22 md:w-32 md:h-32 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img src={getProductImage({ name, image })} alt={name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
                <div className="flex justify-between">
                    <Link to={`/product-details/${slugify(name)}`} className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-1 pe-2 hover:text-blue-500">{name}</Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleUpdateQuantity(newQty - 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-500 cursor-pointer"
                        >
                            <RemoveIcon sx={{ fontSize: "1.2rem" }} />
                        </button>
                        <input
                            type="number"
                            min={0}
                            max={stock}
                            value={newQty}
                            onChange={handleQuantityChange}
                            className="hide-input-spin text-center w-10 px-2 py-1 border border-[#1E88E5] rounded text-sm dark:text-white dark:bg-gray-800"
                        />
                        <button
                            disabled={newQty >= stock}
                            onClick={() => handleUpdateQuantity(newQty + 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 text-green-500 disabled:opacity-50 cursor-pointer"
                        >
                            <AddIcon sx={{ fontSize: "1.2rem" }} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#1E88E5] dark:text-[#00ACC1]">&#8377;{formatNumberWithCommas(discountedPrice)}</span>
                    {discount > 0 && (
                        <>
                            <span className="text-sm line-through text-gray-500">&#8377;{formatNumberWithCommas(price)}</span>
                            <span className="text-sm text-green-600">({discount}&#37; OFF)</span>
                        </>
                    )}
                </div>
                
                <p className="text-sm text-green-600 font-medium">
                    Total: &#8377; {formatNumberWithCommas(itemTotal)}
                    {totalSaved > 0 && <> | You saved &#8377; {totalSaved.toFixed(2)}</>}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selected Quantity: <span className="font-medium">{selectedQuantity} {quantityUnit}</span> ({type || "Not specified"})
                </p>

                {isOutOfStock && (
                    <p className="text-sm text-red-600 font-medium">
                        Only {stock} left in stock. Please reduce quantity.
                    </p>
                )}

                <div className="flex items-center gap-2 mt-3">
                    <button
                        onClick={() => removeFromCart(id)}
                        className="px-3 py-1 rounded text-sm text-[#1E88E5] hover:bg-[#1E88E520] border shadow-md disabled:cursor-not-allowed"
                    >
                        Remove From Cart
                    </button>
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
