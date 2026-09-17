import React, { useContext, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { UserAuthContext, AdminAuthContext } from "../context/AuthProvider"
import { CartContext } from "../context/CartProvider";
import BackButton from "../components/Common/BackButton";
import AnimatedHeading from "../components/Common/AnimatedHeading";
import { getCartProductDetails, calculateCartTotals } from "../utils/cartUtils";
import { getDiscountedPrice } from "../utils/helper";
import { formatNumberWithCommas } from "../utils/format";
import { Edit2, MapPin, Clock } from "lucide-react";
import ProductCard from "../components/CartComponents/ProductCard";
import SavedAddressList from "../components/CartComponents/SavedAddressList";
import EditAddressModel from "./UserProfile/Models/EditAddressModel";
import { updateAddress } from "../services/userProfileService";
import { ProductContext } from "../context/ProductProvider";
import { useSnackbar } from "notistack";
import BuffaloLoader from "../components/BuffaloLoader";

export default function CartPage() {

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { authUser, deliveryAddress, setDeliveryAddress, setOpenLoginDialog } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);
    const currentUser = authUser || authAdmin;
    const { cartItems, removeFromCart } = useContext(CartContext);
    const { products, productLoading } = useContext(ProductContext);

    const [open, setOpen] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [highlightedItems, setHighlightedItems] = useState([]);

    const handleOpenEditAddress = () => {
        if (!deliveryAddress) return;
        setEditingAddress({ ...deliveryAddress });
        setEditModal(true);
    };

    const handleSaveEditedAddress = async (e) => {
        e.preventDefault();
        if (!editingAddress?._id) return;
        setEditLoading(true);
        try {
            const data = await updateAddress(editingAddress._id, editingAddress);
            if (data?.success) {
                const updated = data?.address || editingAddress;
                setDeliveryAddress(updated);
                enqueueSnackbar("Address updated successfully!", { variant: "success" });
                setEditModal(false);
            } else {
                enqueueSnackbar(data?.message || "Failed to update address", { variant: "error" });
            }
        } catch (err) {
            enqueueSnackbar(err?.response?.data?.message || "Failed to update address", { variant: "error" });
        } finally {
            setEditLoading(false);
        }
    };

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
            <div className="w-full max-w-5xl mx-auto px-4 py-4">
                {/* Mobile Top Back Button Only (Left Top) */}
                <div className="md:hidden flex items-center justify-start mb-2">
                    <BackButton fallbackPath="/home" />
                </div>

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
            </div>
        );
    }

    return (
        <>
            {/* Mobile Top Back Button Only (Shown on Mobile Response Only - Left Top) */}
            <div className="md:hidden w-full px-4 pt-3 pb-1 flex items-center justify-start">
                <BackButton fallbackPath="/home" />
            </div>

            {/* Delivery Address Section (Logged-in User Only) */}
            {currentUser && (
                <section className="w-full max-w-5xl mx-auto pt-1 sm:pt-4 pb-2 px-0 md:px-6">
                    {/* Top Action Header Row Above Card: ONLY VISIBLE ON DESKTOP (>= md) */}
                    <div className="hidden md:flex items-center justify-end gap-2 mb-2 px-1">
                        {deliveryAddress && (
                            <button
                                type="button"
                                onClick={handleOpenEditAddress}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-xl border border-amber-300/80 dark:border-amber-700/80 cursor-pointer active:scale-95 transition-all shadow-2xs"
                            >
                                <Edit2 size={13} className="text-amber-600 dark:text-amber-400" />
                                <span>Edit Address</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-black text-white bg-gradient-to-r from-[#6C5CE7] to-[#805AD5] hover:from-[#5b4cc4] hover:to-[#6f48c4] active:scale-95 rounded-xl shadow-md cursor-pointer transition-all border border-purple-400/30"
                        >
                            <MapPin size={13} className="text-purple-100" />
                            <span>{deliveryAddress ? "Change Address" : "Add Address"}</span>
                        </button>
                    </div>

                    {/* Address Content (Full Width on Mobile, Card on Desktop) */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full px-4 py-3 md:p-6 md:rounded-[24px] md:bg-white/85 md:dark:bg-gray-800/85 md:backdrop-blur-[16px] md:border md:border-white/90 md:dark:border-gray-700/80 md:shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-colors duration-300 border-b md:border-b-0 border-gray-200/60 dark:border-gray-700/60 pb-3 md:pb-6"
                    >
                        {deliveryAddress ? (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black uppercase text-[#6C5CE7] dark:text-[#A78BFA] tracking-wider">DELIVER TO</span>
                                        {deliveryAddress?.addressType && (
                                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] dark:bg-[#A78BFA]/20 dark:text-[#A78BFA] font-extrabold border border-[#6C5CE7]/20 dark:border-[#A78BFA]/30 uppercase">
                                                {deliveryAddress.addressType}
                                            </span>
                                        )}
                                    </div>

                                    {/* Mobile-Only "Select Address" Button */}
                                    <button
                                        type="button"
                                        onClick={() => setOpen(true)}
                                        className="md:hidden flex items-center gap-1 text-xs font-extrabold text-[#6C5CE7] dark:text-[#A78BFA] bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 px-3 py-1 rounded-xl border border-purple-200/80 dark:border-purple-800/80 active:scale-95 transition-all cursor-pointer shadow-2xs"
                                    >
                                        <span>Select Address</span>
                                        <span className="text-sm font-black">&rsaquo;</span>
                                    </button>
                                </div>
                                <h3 className="text-sm sm:text-base font-black text-[#2D3748] dark:text-white leading-snug">
                                    {[deliveryAddress?.hno, deliveryAddress?.village || deliveryAddress?.streetAddress].filter(Boolean).join(", ") || deliveryAddress?.streetAddress || "Selected Delivery Location"}
                                </h3>
                                <p className="text-xs text-[#718096] dark:text-gray-300">
                                    {[deliveryAddress?.city || deliveryAddress?.district, `${deliveryAddress?.state || ""} - ${deliveryAddress?.pincode || ""}`].filter(Boolean).join(", ")} &bull; <span className="font-semibold text-gray-500">{deliveryAddress?.name} ({deliveryAddress?.phone})</span>
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3 py-1">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-black uppercase text-[#6C5CE7] dark:text-[#A78BFA] tracking-wider">DELIVER TO</span>
                                    <h2 className="text-sm font-extrabold text-[#2D3748] dark:text-white">
                                        No delivery address selected.
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(true)}
                                    className="flex items-center gap-1 text-xs font-extrabold text-white bg-gradient-to-r from-[#6C5CE7] to-[#805AD5] px-3.5 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                                >
                                    <span>Select Address</span>
                                    <span className="text-sm font-black">&rsaquo;</span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                </section>
            )}

            {/* Cart Items & Summary Grid */}
            <section className={`w-full max-w-5xl mx-auto ${currentUser ? "my-2 md:my-4" : "pt-2 sm:pt-4 pb-6"} px-0 md:px-6 flex flex-col md:flex-row gap-6`}>
                <motion.div layout className="flex-1">
                    {/* Mobile Full Width Items List (Shown on Mobile Response Only - No Card Box) */}
                    <div className="md:hidden w-full mb-4">
                        <div className="w-full divide-y divide-gray-200/60 dark:divide-gray-700/60 border-t border-b border-gray-200/60 dark:border-gray-700/60">
                            {cartDetails.map((item, idx) => (
                                <div key={`mob-${idx * 0.55}`} className="py-1 px-3">
                                    <ProductCard
                                        item={item}
                                        highlightOutOfStock={highlightedItems?.includes(item?.id)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Footer Row: Forgot something? Add More Items */}
                        <div className="py-3 px-4 text-center text-xs text-gray-700 dark:text-gray-300 font-bold">
                            <span>Forgot something? </span>
                            <Link to="/products" className="text-[#6C5CE7] dark:text-[#A78BFA] hover:underline font-black ml-1">
                                Add More Items
                            </Link>
                        </div>
                    </div>

                    {/* Desktop View List of Cards (>= md) */}
                    <div className="hidden md:block space-y-4">
                        {cartDetails.map((item, idx) => (
                            <ProductCard
                                key={idx * 0.55}
                                item={item}
                                highlightOutOfStock={highlightedItems?.includes(item?.id)}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Price Details Summary (Full Width on Mobile, Card on Desktop) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full md:w-80 px-4 py-4 md:p-6 md:rounded-[28px] md:bg-white/85 md:dark:bg-gray-800/85 md:backdrop-blur-[16px] md:border md:border-white/90 md:dark:border-gray-700/80 md:shadow-[0_10px_30px_rgba(0,0,0,0.04)] h-fit space-y-4 border-t md:border-t-0 border-gray-200/60 dark:border-gray-700/60 pt-4 md:pt-6"
                >
                    <AnimatedHeading
                        blackText="Price"
                        violetText="Details"
                        className="text-xl font-black text-[#2D3748] dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700"
                    />

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

            {editModal && editingAddress && (
                <EditAddressModel
                    open={editModal}
                    selectedAddress={editingAddress}
                    setSelectedAddress={setEditingAddress}
                    handleClose={() => setEditModal(false)}
                    handleSubmit={handleSaveEditedAddress}
                    loading={editLoading}
                />
            )}
        </>
    )
}
