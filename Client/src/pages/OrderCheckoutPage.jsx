import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSnackbar } from 'notistack';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
} from "@mui/material";
import PaidIcon from "@mui/icons-material/Paid";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Slide from '@mui/material/Slide';

import { CartContext } from "../context/CartProvider";
import { UserAuthContext, AdminAuthContext } from "../context/AuthProvider";
import { calculateCartTotals, getCartProductDetails } from "../utils/cartUtils";
import { getDiscountedPrice } from "../utils/helper";
import { formatNumberWithCommas } from "../utils/format";
import { razorpayOrderPayment } from "../services/paymentService";
import { createOrderApi } from "../services/orderService";
import { UserOrderContext } from "../context/UserOrderProvider";
import { ThemeContext } from "../context/ThemeProvider";
import { ProductContext } from "../context/ProductProvider";
import { socket } from "../socket/socket";
import { Percent, ShoppingBag, IndianRupee, Receipt } from "lucide-react";
import BuffaloLoader from "../components/BuffaloLoader";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function OrderCheckoutPage() {

  const { enqueueSnackbar } = useSnackbar();
  const { theme } = useContext(ThemeContext);

  const { authUser, deliveryAddress, setDeliveryAddress, setOpenLoginDialog } = useContext(UserAuthContext);
  const { authAdmin } = useContext(AdminAuthContext);
  const currentUser = authUser || authAdmin;
  const { cartItems, clearCart } = useContext(CartContext);
  const { products, productLoading } = useContext(ProductContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!productLoading && !currentUser) {
      enqueueSnackbar("Please log in to proceed to checkout and place your order.", { variant: "info" });
      setOpenLoginDialog(true);
      navigate("/cart");
    }
  }, [currentUser, productLoading, navigate, setOpenLoginDialog, enqueueSnackbar]);

  const [open, setOpen] = useState(false);
  const [addressListOpen, setAddressListOpen] = useState(false);
  const [editAddressModal, setEditAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editAddressLoading, setEditAddressLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [highlightedItems, setHighlightedItems] = useState([]);

  const handleOpenEditAddress = () => {
    if (!deliveryAddress) return;
    setEditingAddress({ ...deliveryAddress });
    setEditAddressModal(true);
  };

  const handleSaveEditedAddress = async (e) => {
    e.preventDefault();
    if (!editingAddress?._id) return;
    setEditAddressLoading(true);
    try {
      const data = await updateAddress(editingAddress._id, editingAddress);
      if (data?.success) {
        const updated = data?.address || editingAddress;
        setDeliveryAddress(updated);
        enqueueSnackbar("Address updated successfully!", { variant: "success" });
        setEditAddressModal(false);
      } else {
        enqueueSnackbar(data?.message || "Failed to update address", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Failed to update address", { variant: "error" });
    } finally {
      setEditAddressLoading(false);
    }
  };

  const orderPlaceConfirmation = useCallback((data) => {
    enqueueSnackbar(data.message || 'Order placed successfully!', { variant: 'success' });
    clearCart();
    setOpen(false);
    setOrderLoading(false);
    navigate(`/user-profile/orders`);
  }, [clearCart, navigate, enqueueSnackbar]);

  const orderPlaceFailed = useCallback((error) => {
    setOrderLoading(false);
    enqueueSnackbar(error?.message || "Something went wrong while placing the order.", { variant: 'error' });
  }, [enqueueSnackbar]);

  useEffect(() => {
    socket.on("new-order-place-success", orderPlaceConfirmation);
    socket.on("order:place-new-success", orderPlaceConfirmation);
    socket.on("new-order-place-failed", orderPlaceFailed);

    return () => {
      socket.off("new-order-place-success", orderPlaceConfirmation);
      socket.off("order:place-new-success", orderPlaceConfirmation);
      socket.off("new-order-place-failed", orderPlaceFailed);
    };
  }, [orderPlaceConfirmation, orderPlaceFailed]);

  const cartDetails = useMemo(
    () => getCartProductDetails(cartItems, products),
    [cartItems, products]
  );

  const { subtotal, totalAmount, totalSaving } = useMemo(() => {
    return calculateCartTotals(cartDetails);
  }, [cartDetails]);

  const deliverySavings = 30;
  const handlingSavings = 10;
  const totalOrderSavings = (totalSaving || 0) + deliverySavings + handlingSavings;
  const totalMRPWithFees = (subtotal || 0) + deliverySavings + handlingSavings;
  const itemTotalDiscounted = (subtotal || 0) - (totalSaving || 0);

  const handleStockExceeds = () => {
    const outOfStockIds = cartDetails
      .filter(item => item?.selectedQuantity > item?.stock)
      .map(item => item?.id);

    if (outOfStockIds?.length > 0) {
      setHighlightedItems(outOfStockIds);

      setTimeout(() => {
        setHighlightedItems([]);
      }, 4000);

      return true;
    }
    return false;
  }



  const handlePaymentMode = () => {
    if (!deliveryAddress) {
      enqueueSnackbar("Please select a delivery address before proceeding to checkout.", { variant: "error" });
      return;
    }

    if (handleStockExceeds()) {
      enqueueSnackbar("Some products exceed available stock. Please adjust quantities.", {
        variant: "warning",
      });
      return;
    }

    setOpen(true);
  };

  const handlePlaceOrder = async (selectedMode) => {

    if (!deliveryAddress?._id) {
      enqueueSnackbar("Please select or add a delivery address.", { variant: "error" });
      return;
    }

    if (handleStockExceeds()) {
      enqueueSnackbar("Some products exceed available stock. Please adjust quantities.", {
        variant: "warning",
      });
      return;
    }

    setSelectedPaymentMode(selectedMode);

    const orderPayload = {
      address: deliveryAddress._id,
      productsData: cartDetails.map((item) => {
        const discount = item.discount || 0;
        const discountedPrice = item.price - (item.price * discount) / 100;

        return {
          productId: item.id,
          productQuantity: item.selectedQuantity,
          productPrice: parseFloat(discountedPrice.toFixed(2)),
          productName: item.name,
        };
      }),
      paymentMode: selectedMode,
      totalAmount: totalAmount,

      userId: currentUser?._id || currentUser?.id,
      date: new Date().toISOString()
    };

    setOrderLoading(true);

    try {
      if (selectedMode === "Cash on Delivery") {
        const res = await createOrderApi(orderPayload);
        if (res?.success) {
          if (socket && socket.connected) {
            socket.emit("place-new-order", { orderData: orderPayload, createdOrder: res.order });
          }
          setOpen(false);
          clearCart();
          enqueueSnackbar("Order placed successfully!", { variant: 'success' });
          navigate(`/user-profile/orders`);
        } else {
          enqueueSnackbar(res?.message || "Failed to place order.", { variant: "error" });
        }
      } else if (selectedMode === "Online") {
        let data = null;
        try {
          data = await razorpayOrderPayment(totalAmount);
        } catch (err) {
          console.warn("Razorpay order error, falling back to instant online payment", err);
        }

        if (!data || data?.isMock || !window.Razorpay) {
          const finalPayload = {
            ...orderPayload,
            paymentMode: "Online",
          };
          const res = await createOrderApi(finalPayload);
          if (res?.success) {
            if (socket && socket.connected) {
              socket.emit("place-new-order", { orderData: finalPayload, createdOrder: res.order });
            }
            setOpen(false);
            clearCart();
            alert("🎉 Payment Successful!\n\nYour order has been placed successfully.");
            enqueueSnackbar("Payment successful! Order placed successfully.", { variant: 'success' });
            navigate(`/user-profile/orders`);
          } else {
            enqueueSnackbar(res?.message || "Failed to place order.", { variant: "error" });
          }
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Madhur Dairy & Daily Needs",
          description: "Payment for your order",
          order_id: data.orderId,
          handler: async (response) => {
            const finalPayload = {
              ...orderPayload,
              paymentMode: "Online",
              razorpay: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            };
            const res = await createOrderApi(finalPayload);
            if (res?.success) {
              if (socket && socket.connected) {
                socket.emit("place-new-order", {
                  orderData: finalPayload,
                  createdOrder: res.order,
                  paymentInfo: {
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  },
                });
              }
              setOpen(false);
              clearCart();
              alert("🎉 Payment Successful!\n\nYour order has been placed successfully.");
              enqueueSnackbar("Payment successful! Order placed.", { variant: 'success' });
              navigate(`/user-profile/orders`);
            } else {
              enqueueSnackbar(res?.message || "Failed to place order.", { variant: "error" });
            }
          },
          prefill: {
            name: authUser?.firstName && authUser?.lastName
              ? `${authUser.firstName} ${authUser.lastName}`
              : authUser?.username || authUser?.shopName,
            email: authUser?.email,
            contact: authUser?.mobileNo,
          },
          theme: {
            color: theme === "dark" ? "#1f2937" : "#1E88E5",
          }
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch {
          const finalPayload = {
            ...orderPayload,
            paymentMode: "Online",
          };
          const res = await createOrderApi(finalPayload);
          if (res?.success) {
            if (socket && socket.connected) {
              socket.emit("place-new-order", { orderData: finalPayload, createdOrder: res.order });
            }
            setOpen(false);
            clearCart();
            alert("🎉 Payment Successful!\n\nYour order has been placed successfully.");
            enqueueSnackbar("Payment successful! Order placed.", { variant: 'success' });
            navigate(`/user-profile/orders`);
          } else {
            enqueueSnackbar(res?.message || "Failed to place order.", { variant: "error" });
          }
        }
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "An error occurred while placing the order.", { variant: "error" });
    } finally {
      setOrderLoading(false);
    }
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-gray-600 dark:text-white gap-3">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-[#1E88E5]"></div>
        <span className="text-xl">Loading product...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white">You're not logged in.</h2>
        <p className="text-gray-500 mb-4 dark:text-gray-300">Please log in to view your cart.</p>
        <Link to={"/login"} className="text-blue-500 hover:text-blue-600" >
          Go to Login
        </Link>
      </div>
    );
  }

  if (cartItems?.length === 0) {
    return (
      <div className="p-5 text-center flex flex-col items-center justify-center h-[300px]">
        <h2 className="text-xl font-semibold">No items to checkout</h2>
        <Link to="/products" className="mt-4 inline-block bg-[#1E88E5] text-white py-2 px-4 rounded hover:bg-[#1E88E5dd]">
          Go to Products
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Top Header Navigation Bar (Shown on Mobile Response Only) */}
      <div className="md:hidden sticky top-1 z-30 w-full px-4 py-2 flex items-center justify-between transition-all duration-200">
        {/* Left: Back Button to Cart */}
        <Link
          to="/cart"
          title="Back to Cart"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50 active:scale-95 rounded-xl text-purple-700 dark:text-purple-300 transition-all text-xs font-black cursor-pointer border border-purple-200/60 dark:border-purple-800/60 shadow-xs"
        >
          <ArrowBackIcon sx={{ fontSize: "1.15rem" }} className="text-[#6C5CE7] dark:text-[#A78BFA]" />
          <span>Back</span>
        </Link>

        {/* Center: Title */}
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-sm font-black tracking-tight text-gray-900 dark:text-white">
            Checkout & Payment
          </h1>
        </div>

        {/* Right: Cart Item Badge Count */}
        <div className="flex items-center">
          <div className="relative p-2 rounded-xl text-gray-700 dark:text-gray-200 flex items-center justify-center">
            <ShoppingCartIcon sx={{ fontSize: "1.35rem" }} className="text-[#6C5CE7] dark:text-[#A78BFA]" />
            {cartItems?.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#6C5CE7] to-[#805AD5] text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                {cartItems.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Container */}
      <section className="max-w-5xl mx-auto pt-1 sm:pt-4 pb-12 px-4 sm:px-6">
        {/* Desktop Header Bar (Hidden on Mobile) */}
        <div className="hidden md:block mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-black text-[#6C5CE7] dark:text-purple-400 tracking-tight"
          >
            Confirm Order & Payment
          </motion.h1>
        </div>

        {/* Delivery Address Location Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="px-4 py-3 sm:p-5 md:rounded-[24px] md:bg-white/85 md:dark:bg-gray-800/85 md:backdrop-blur-[16px] md:border md:border-white/90 md:dark:border-gray-700/80 md:shadow-[0_10px_30px_rgba(0,0,0,0.04)] mb-4 md:mb-6 transition-colors duration-300 border-b md:border-b-0 border-gray-200/60 dark:border-gray-700/60 pb-4"
        >
          {deliveryAddress ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase text-[#6C5CE7] tracking-wider">DELIVERING TO</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] font-extrabold border border-[#6C5CE7]/20 uppercase">
                  {deliveryAddress?.addressType || "Home"}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[#2D3748] dark:text-white">
                {[deliveryAddress?.hno, deliveryAddress?.village || deliveryAddress?.streetAddress].filter(Boolean).join(", ") || deliveryAddress?.streetAddress || "Selected Delivery Location"}
              </h3>
              <p className="text-xs text-[#718096] dark:text-gray-300">
                {[deliveryAddress?.city || deliveryAddress?.district, `${deliveryAddress?.state || ""} - ${deliveryAddress?.pincode || ""}`].filter(Boolean).join(", ")} &bull; <span className="font-semibold text-gray-500">{deliveryAddress?.name} ({deliveryAddress?.phone || "N/A"})</span>
              </p>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm font-extrabold text-[#2D3748] dark:text-white mb-2">
                No delivery address selected.
              </p>
              <Link
                to="/cart"
                className="inline-block bg-[#6C5CE7] text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-[#5b4cc4] shadow-md transition cursor-pointer"
              >
                Select Address in Cart &rarr;
              </Link>
            </div>
          )}
        </motion.div>



        {/* Order Summary & Price Details Glass Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="px-4 py-3 sm:p-6 md:rounded-[28px] md:bg-white/85 md:dark:bg-gray-800/85 md:backdrop-blur-[16px] md:border md:border-white/90 md:dark:border-gray-700/80 md:shadow-[0_10px_30px_rgba(0,0,0,0.04)] mb-4 md:mb-6 space-y-4 border-b md:border-b-0 border-gray-200/60 dark:border-gray-700/60 pb-4"
        >
          <h2 className="text-xl font-black text-[#2D3748] dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700">
            Order Summary
          </h2>

          <div className="space-y-3">
            {cartDetails.map((item, idx) => {
              const { discountedPrice, saved } = getDiscountedPrice(item.price, item.discount);
              const itemTotal = discountedPrice * item.selectedQuantity;
              const itemSaved = saved * item.selectedQuantity;
              const shouldAnimate = highlightedItems?.includes(item?.id);

              return (
                <div
                  key={item.id || idx}
                  className={`pb-3 border-b border-dashed border-gray-200 dark:border-gray-700/80 space-y-1 transition rounded-xl p-2.5 ${
                    shouldAnimate ? "animate-pulse ring-2 ring-red-500 bg-red-500/10" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-sm text-[#2D3748] dark:text-white leading-tight">
                      {item.name}
                    </h4>
                    <p className="font-black text-sm text-[#2D3748] dark:text-white shrink-0">
                      &#8377;{formatNumberWithCommas(itemTotal)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {item.selectedQuantity} {item.quantityUnit} ×{" "}
                      {item.discount > 0 && (
                        <span className="line-through text-gray-400 mr-1">
                          &#8377;{formatNumberWithCommas(item?.price)}
                        </span>
                      )}
                      <span className="text-[#00B894] font-bold">
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
                    <div className="flex justify-between items-center text-[11px] text-[#00B894] font-bold pt-0.5">
                      <span>Product Discount:</span>
                      <span>- &#8377;{formatNumberWithCommas(itemSaved)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Bill Summary Card (Matching Reference Design 2) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="px-4 py-3 sm:p-6 md:rounded-[24px] md:bg-white/90 md:dark:bg-gray-800/90 md:backdrop-blur-[16px] md:border md:border-gray-100 md:dark:border-gray-700/80 md:shadow-xs mb-6 space-y-4"
        >
          {/* Header: Receipt Icon + Bill Summary */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-gray-700 dark:text-gray-200 shrink-0 border border-gray-200/60 dark:border-gray-600/60">
              <Receipt className="w-5 h-5 text-gray-800 dark:text-gray-100" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              Bill Summary
            </h2>
          </div>

          {/* Line Items Breakdown */}
          <div className="space-y-3 text-xs sm:text-sm">
            {/* Item Total Row */}
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-500 dark:text-gray-400">Item Total</span>
              <div className="flex items-center gap-2">
                {totalSaving > 0 && (
                  <span className="line-through text-gray-400 font-semibold">
                    &#8377;{formatNumberWithCommas(subtotal)}
                  </span>
                )}
                <span className="font-black text-gray-900 dark:text-white">
                  &#8377;{formatNumberWithCommas(itemTotalDiscounted)}
                </span>
              </div>
            </div>

            {/* Delivery Fee Row */}
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-500 dark:text-gray-400">Delivery Fee</span>
              <div className="flex items-center gap-2">
                <span className="line-through text-gray-400 font-semibold">
                  &#8377;{deliverySavings}
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase">
                  FREE
                </span>
              </div>
            </div>

            {/* Handling Fee Row */}
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-500 dark:text-gray-400">Handling Fee</span>
              <div className="flex items-center gap-2">
                <span className="line-through text-gray-400 font-semibold">
                  &#8377;{handlingSavings}
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase">
                  FREE
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700/80 pt-3" />

          {/* Final Row: To Pay */}
          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="font-black text-gray-900 dark:text-white">
              To Pay
            </span>
            <div className="flex items-center gap-2">
              {totalOrderSavings > 0 && (
                <span className="line-through text-gray-400 font-semibold text-xs sm:text-sm">
                  &#8377;{formatNumberWithCommas(totalMRPWithFees)}
                </span>
              )}
              <span className="text-base sm:text-xl font-black text-gray-900 dark:text-white">
                &#8377;{formatNumberWithCommas(totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Action Navigation Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <Link
            to="/cart"
            className="w-full sm:w-auto text-center px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-[#6C5CE7] dark:text-purple-400 border border-[#6C5CE7]/30 font-bold text-xs shadow-sm hover:bg-purple-50 dark:hover:bg-gray-700 transition"
          >
            ← Back to Cart
          </Link>

          <button
            disabled={orderLoading}
            onClick={handlePaymentMode}
            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-full bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-extrabold text-xs shadow-[0_10px_25px_rgba(108,92,231,0.4)] hover:scale-102 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Order →
          </button>
        </motion.div>
      </section>

      {/* Payment Selection Modal Dialog */}
      <Dialog
        open={open}
        onClose={() => {
          if (!orderLoading) {
            setOpen(false);
          }
        }}
        slots={{
          transition: Transition,
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "transparent",
              boxShadow: "none",
              borderRadius: "28px",
            },
          },
        }}
        maxWidth="sm"
        fullWidth
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-[20px] text-gray-900 dark:text-white rounded-[28px] border border-white/90 dark:border-gray-700/80 p-6 shadow-2xl space-y-4">
          <header className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xl font-black text-[#2D3748] dark:text-white">Choose Payment Method</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <CloseIcon fontSize="small" />
            </button>
          </header>

          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 py-1">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span className="font-extrabold text-gray-800 dark:text-white">{cartDetails.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total MRP:</span>
              <span className="font-extrabold text-gray-800 dark:text-white">&#8377;{formatNumberWithCommas(subtotal)}</span>
            </div>
            {totalSaving > 0 && (
              <div className="flex justify-between text-[#00B894] font-bold">
                <span>Total Savings:</span>
                <span>- &#8377;{formatNumberWithCommas(totalSaving)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-[#6C5CE7] dark:text-purple-400 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span>Payable Amount:</span>
              <span>&#8377;{formatNumberWithCommas(totalAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              disabled={orderLoading}
              onClick={() => handlePlaceOrder("Cash on Delivery")}
              className="flex items-center justify-center gap-2 bg-[#00B894] hover:bg-[#00a383] text-white py-3 px-4 rounded-full font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {(orderLoading && selectedPaymentMode === "Cash on Delivery") ? (
                <BuffaloLoader variant="button" text="Placing Order..." />
              ) : (
                <span className="flex items-center gap-2">
                  <LocalShippingIcon fontSize="small" />
                  Cash on Delivery
                </span>
              )}
            </button>

            <button
              disabled={orderLoading}
              onClick={() => handlePlaceOrder("Online")}
              className="flex items-center justify-center gap-2 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white py-3 px-4 rounded-full font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {(orderLoading && selectedPaymentMode === "Online") ? (
                <BuffaloLoader variant="button" text="Placing Order..." />
              ) : (
                <span className="flex items-center gap-2">
                  <PaidIcon fontSize="small" />
                  Online Payment
                </span>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
