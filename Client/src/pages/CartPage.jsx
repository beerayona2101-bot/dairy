import React, { useContext, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { UserAuthContext, AdminAuthContext } from "../context/AuthProvider"
import { CartContext } from "../context/CartProvider";
import { getCartProductDetails, calculateCartTotals } from "../utils/cartUtils";
import { getDiscountedPrice } from "../utils/helper";
import { formatNumberWithCommas } from "../utils/format";
import ProductCard from "../components/CartComponents/ProductCard";
import SavedAddressList from "../components/CartComponents/SavedAddressList";
import { ProductContext } from "../context/ProductProvider";
import { useSnackbar } from "notistack";
import BuffaloLoader from "../components/BuffaloLoader";

export default function CartPage() {

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { authUser, deliveryAddress, setOpenLoginDialog } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);
    const currentUser = authUser || authAdmin;
    const { cartItems, removeFromCart } = useContext(CartContext);
    const { products, productLoading } = useContext(ProductContext);

    const [open, setOpen] = useState(false);
    const [highlightedItems, setHighlightedItems] = useState([]);

    const cartDetails = useMemo(
        () => getCartProductDetails(cartItems, products, removeFromCart),
        [cartItems, products, removeFromCart]
    );

    const { subtotal, totalAmount, totalSaving } = useMemo(() => {
        return calculateCartTotals(cartDetails);
    }, [cartDetails]);


    const handleDialogStatus = (status) => {
        setOpen(status);
    }

    const handleProceedCheckout = () => {
        if (!currentUser) {
            sessionStorage.setItem("redirectAfterLogin", "/order-checkout");
            enqueueSnackbar("Please log in to proceed to checkout.", { variant: "info" });
            setOpenLoginDialog(true);
            return;
        }

        if (!deliveryAddress) {
            enqueueSnackbar("Please select or add a delivery address to proceed.", { variant: "warning" });
            setOpen(true);
            return;
        }

        const outOfStockItems = cartDetails?.filter(item => item?.selectedQuantity > item?.stock);

        if (outOfStockItems?.length > 0) {
            const outOfStockIds = outOfStockItems?.map(item => item?.id);
            setHighlightedItems(outOfStockIds);

            setTimeout(() => {
                setHighlightedItems([]);
            }, 3000);

            return;
        }

        navigate("/order-checkout");
    };

    if (productLoading) {
        return <BuffaloLoader variant="inline" text="Loading cart items..." />;
    }

    if (cartItems?.length === 0) {
        return (
            <div className="px-3 py-10 text-center">
                <ShoppingCartIcon className="mx-auto text-4xl text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Could not find matching products in your cart.
                </p>
                <Link
                    to="/products"
                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-blue-500 hover:text-blue-600 rounded hover:bg-primary-600 transition"
                >
                    <ArrowBackIcon className="mr-2" sx={{ fontSize: "1.3rem" }} />
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Delivery Address Glass Section (Logged-in User Only) */}
            {currentUser && (
                <section className="max-w-5xl mx-auto pt-20 sm:pt-24 pb-6 px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="p-6 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-colors duration-300"
                    >
                        {deliveryAddress ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-black uppercase text-[#6C5CE7] tracking-wider">DELIVER TO</span>
                                        <span className="text-xs px-3 py-0.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] font-extrabold border border-[#6C5CE7]/20 uppercase">
                                            {deliveryAddress?.addressType || "Home"}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-black text-[#2D3748] dark:text-white">
                                        {[deliveryAddress?.hno, deliveryAddress?.village || deliveryAddress?.streetAddress].filter(Boolean).join(", ") || deliveryAddress?.streetAddress || "Selected Delivery Location"}
                                    </h3>
                                    <p className="text-xs text-[#718096] dark:text-gray-300">
                                        {[deliveryAddress?.city || deliveryAddress?.district, `${deliveryAddress?.state || ""} - ${deliveryAddress?.pincode || ""}`].filter(Boolean).join(", ")} &bull; <span className="font-semibold text-gray-500">{deliveryAddress?.name} ({deliveryAddress?.phone})</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOpen(true)}
                                    className="px-5 py-2 text-xs font-bold text-[#6C5CE7] bg-purple-50 dark:bg-purple-950/40 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100 cursor-pointer transition shrink-0 self-start sm:self-auto"
                                >
                                    Change Address
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <h2 className="text-base font-extrabold text-[#2D3748] dark:text-white mb-2">
                                    No delivery address selected.
                                </h2>
                                <button
                                    onClick={() => setOpen(true)}
                                    className="bg-[#6C5CE7] text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-[#5b4cc4] shadow-md transition cursor-pointer"
                                >
                                    Add Address
                                </button>
                            </div>
                        )}
                    </motion.div>
                </section>
            )}

            {/* Cart Items & Summary Glass Grid */}
            <section className={`max-w-5xl mx-auto ${currentUser ? "my-6" : "pt-20 sm:pt-24 pb-6"} px-4 sm:px-6 flex flex-col md:flex-row gap-6`}>
                <motion.div layout className="space-y-4 flex-1">
                    {cartDetails.map((item, idx) => (
                        <ProductCard
                            key={idx * 0.55}
                            item={item}
                            highlightOutOfStock={highlightedItems?.includes(item?.id)}
                        />
                    ))}
                </motion.div>

                {/* Price Details Glass Summary Box */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full md:w-80 p-6 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] h-fit space-y-4"
                >
                    <h2 className="text-xl font-black text-[#2D3748] dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700">
                        Price Details
                    </h2>

                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-hide">
                        {cartDetails.map((item, idx) => {
                            const { discountedPrice, saved } = getDiscountedPrice(item.price, item.discount);
                            const itemTotal = discountedPrice * item.selectedQuantity;
                            const itemSaved = saved * item.selectedQuantity;

                            return (
                                <div
                                    key={idx * 0.89}
                                    className="pb-2.5 border-b border-dashed border-gray-200 dark:border-gray-700 text-xs space-y-1"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-extrabold text-[#2D3748] dark:text-white leading-tight">
                                            {item.name}
                                        </p>
                                        <span className="font-extrabold text-[#2D3748] dark:text-white shrink-0">
                                            &#8377;{formatNumberWithCommas(itemTotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-[11px]">
                                        <span>
                                            {item.selectedQuantity} {item.quantityUnit} ×{" "}
                                            {item.discount > 0 && (
                                                <span className="line-through text-gray-400 mr-1">
                                                    &#8377;{formatNumberWithCommas(item.price)}
                                                </span>
                                            )}
                                            <span className="font-bold text-[#2D3748] dark:text-gray-200">
                                                &#8377;{formatNumberWithCommas(discountedPrice)}
                                            </span>
                                        </span>
                                        {item.discount > 0 && (
                                            <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-1.5 py-0.5 rounded font-bold">
                                                {item.discount}% OFF
                                            </span>
                                        )}
                                    </div>

                                    {itemSaved > 0 && (
                                        <div className="flex justify-between items-center text-[11px] text-[#00B894] font-bold">
                                            <span>Product Discount:</span>
                                            <span>- &#8377;{formatNumberWithCommas(itemSaved)}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                        <div className="flex justify-between font-bold text-gray-600 dark:text-gray-400">
                            <span>Total MRP</span>
                            <span>&#8377;{formatNumberWithCommas(subtotal)}</span>
                        </div>

                        {totalSaving > 0 && (
                            <div className="flex justify-between font-bold text-[#00B894]">
                                <span>Total Product Discount</span>
                                <span>- &#8377;{formatNumberWithCommas(totalSaving)}</span>
                            </div>
                        )}

                        <div className="flex justify-between font-bold text-gray-600 dark:text-gray-400">
                            <span>Delivery Charges</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">FREE</span>
                        </div>

                        <div className="flex justify-between text-base font-black text-[#6C5CE7] dark:text-purple-400 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                            <span>Final Total</span>
                            <span>&#8377;{formatNumberWithCommas(totalAmount)}</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleProceedCheckout}
                            className="w-full text-center bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white py-3 rounded-full font-extrabold text-xs shadow-[0_10px_25px_rgba(108,92,231,0.4)] hover:scale-102 transition cursor-pointer"
                        >
                            Proceed to Checkout →
                        </button>

                        {totalSaving > 0 && (
                            <p className="text-[11px] font-bold text-[#00B894] text-center mt-3 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                🎉 Total Savings: &#8377;{formatNumberWithCommas(totalSaving)}
                            </p>
                        )}
                    </div>
                </motion.div>
            </section>

            <section className="max-w-5xl mx-auto my-8 px-4 flex justify-center">
                <Link
                    to="/products"
                    className="text-center bg-white dark:bg-gray-800 text-[#6C5CE7] border border-[#6C5CE7]/30 py-2.5 px-6 rounded-full font-bold text-xs shadow-sm hover:bg-purple-50 transition"
                >
                    + Add More Products
                </Link>
            </section>

            <SavedAddressList open={open} handleDialogStatus={handleDialogStatus} />
        </>
    )
}