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
            {/* Delivery Address Glass Section */}
            <section className="max-w-5xl mx-auto pt-20 sm:pt-24 pb-6 px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-6 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-colors duration-300"
                >
                    {deliveryAddress ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-black uppercase text-[#6C5CE7] tracking-wider">Deliver To</span>
                                    <span className="text-xs px-3 py-0.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] font-extrabold">
                                        {deliveryAddress?.addressType}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-[#2D3748] dark:text-white">
                                    {deliveryAddress?.name} <span className="text-xs font-normal text-gray-500">({deliveryAddress?.phone})</span>
                                </h3>
                                <p className="text-xs text-[#718096] dark:text-gray-300 mt-0.5">
                                    {deliveryAddress?.streetAddress}, {deliveryAddress?.city}, {deliveryAddress?.state} - {deliveryAddress?.pincode}
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

            {/* Cart Items & Summary Glass Grid */}
            <section className="max-w-5xl mx-auto my-6 px-4 sm:px-6 flex flex-col md:flex-row gap-6">
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
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full md:w-80 p-6 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] h-fit space-y-4"
                >
                    <h2 className="text-xl font-black text-[#2D3748] dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700">
                        Price Details
                    </h2>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {cartDetails.map((item, idx) => {
                            const { discountedPrice, saved } = getDiscountedPrice(item.price, item.discount);
                            const itemTotal = discountedPrice * item.selectedQuantity;
                            const itemSaved = saved * item.selectedQuantity;

                            return (
                                <div
                                    key={idx * 0.89}
                                    className="pb-2 border-b border-dashed border-gray-200 dark:border-gray-700 text-xs space-y-0.5"
                                >
                                    <p className="font-extrabold text-[#2D3748] dark:text-white">
                                        {item.name}
                                    </p>

                                    <div className="flex justify-between items-center text-gray-500">
                                        <span>{item.selectedQuantity} {item.quantityUnit} × &#8377;{formatNumberWithCommas(discountedPrice)}</span>
                                        <span className="font-extrabold text-[#2D3748] dark:text-white">&#8377;{formatNumberWithCommas(itemTotal)}</span>
                                    </div>

                                    {saved > 0 && (
                                        <p className="text-[10px] text-[#00B894] font-bold">
                                            Saved &#8377;{formatNumberWithCommas(itemSaved)}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                        <div className="flex justify-between font-bold text-gray-500">
                            <span>Total MRP</span>
                            <span>&#8377;{formatNumberWithCommas(subtotal)}</span>
                        </div>

                        <div className="flex justify-between text-base font-black text-[#6C5CE7] pt-1">
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