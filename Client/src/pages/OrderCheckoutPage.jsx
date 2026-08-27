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
import Slide from '@mui/material/Slide';

import { CartContext } from "../context/CartProvider";
import { UserAuthContext, AdminAuthContext } from "../context/AuthProvider";
import { calculateCartTotals, getCartProductDetails } from "../utils/cartUtils";
import { getDiscountedPrice } from "../utils/helper";
import { formatNumberWithCommas } from "../utils/format";
import { formatFullAddress } from "../utils/dateUtils";
import { razorpayOrderPayment } from "../services/paymentService";
import { createOrderApi } from "../services/orderService";
import { updateAddress } from "../services/userProfileService";
import { UserOrderContext } from "../context/UserOrderProvider";
import { ThemeContext } from "../context/ThemeProvider";
import { ProductContext } from "../context/ProductProvider";
import { socket } from "../socket/socket";
import SavedAddressList from "../components/CartComponents/SavedAddressList";
import EditAddressModel from "../pages/UserProfile/Models/EditAddressModel";
import BuffaloLoader from "../components/BuffaloLoader";
import { Edit2 } from "lucide-react";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function OrderCheckoutPage() {

  const { enqueueSnackbar } = useSnackbar();
  const { theme } = useContext(ThemeContext);

  const { authUser, deliveryAddress, setDeliveryAddress } = useContext(UserAuthContext);
  const { authAdmin } = useContext(AdminAuthContext);
  const currentUser = authUser || authAdmin;
  const { cartItems, clearCart } = useContext(CartContext);
  const { products, productLoading } = useContext(ProductContext);
  const navigate = useNavigate();

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
        const data = await razorpayOrderPayment(totalAmount);

        if (data?.isMock || !window.Razorpay) {
          const res = await createOrderApi({
            ...orderPayload,
            paymentMode: "Online (Test Mode)",
          });
          if (res?.success) {
            if (socket && socket.connected) {
              socket.emit("place-new-order", { orderData: orderPayload, createdOrder: res.order });
            }
            setOpen(false);
            clearCart();
            enqueueSnackbar("Order placed successfully (Test Mode)!", { variant: 'success' });
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
            const res = await createOrderApi({
              ...orderPayload,
              razorpay: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            });
            if (res?.success) {
              if (socket && socket.connected) {
                socket.emit("place-new-order", {
                  orderData: orderPayload,
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
              enqueueSnackbar("Payment successful! Order placed.", { variant: 'success' });
              navigate(`/user-profile/orders`);
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
          const res = await createOrderApi({
            ...orderPayload,
            paymentMode: "Online (Test Mode)",
          });
          if (res?.success) {
            setOpen(false);
            clearCart();
            enqueueSnackbar("Order placed successfully (Test Mode)!", { variant: 'success' });
            navigate(`/user-profile/orders`);
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
      {/* Checkout Container */}
      <section className="max-w-5xl mx-auto pt-20 sm:pt-24 pb-12 px-4 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-black text-[#6C5CE7] dark:text-purple-400 mb-6 tracking-tight"
        >
          Confirm Order & Delivery
        </motion.h1>

        {/* Delivery Address Glass Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] mb-6 transition-colors duration-300"
        >
          {deliveryAddress ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-[#6C5CE7] tracking-wider">Deliver To</span>
                  <span className="text-xs px-3 py-0.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] font-extrabold border border-[#6C5CE7]/20">
                    {deliveryAddress?.addressType || "Home"}
                  </span>
                </div>
                <h3 className="text-base font-black text-[#2D3748] dark:text-white">
                  {deliveryAddress?.name} <span className="text-xs font-semibold text-gray-500">📞 ({deliveryAddress?.phone || "N/A"})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#718096] dark:text-gray-300 pt-1">
                  {deliveryAddress?.hno && (
                    <p><strong className="text-gray-900 dark:text-white">House No:</strong> {deliveryAddress.hno}</p>
                  )}
                  {deliveryAddress?.village && (
                    <p><strong className="text-gray-900 dark:text-white">Village / Locality:</strong> {deliveryAddress.village}</p>
                  )}
                  <p className="sm:col-span-2">
                    <strong className="text-gray-900 dark:text-white">Street / Landmark:</strong> {deliveryAddress?.streetAddress || "-"}
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white">City / District:</strong> {deliveryAddress?.city || deliveryAddress?.district || "-"}
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white">State & Pincode:</strong> {deliveryAddress?.state || "-"} - <span className="font-bold text-gray-900 dark:text-white">{deliveryAddress?.pincode || "-"}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleOpenEditAddress}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#6C5CE7] bg-purple-50 dark:bg-purple-950/40 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100 cursor-pointer transition"
                >
                  <Edit2 size={13} />
                  <span>Edit Address</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddressListOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
                >
                  Change Address
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-base font-extrabold text-[#2D3748] dark:text-white mb-3">
                No delivery address selected.
              </p>
              <button
                onClick={() => setAddressListOpen(true)}
                className="bg-[#6C5CE7] text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-[#5b4cc4] shadow-md transition cursor-pointer"
              >
                Add / Select Address
              </button>
            </div>
          )}
        </motion.div>

        {/* Order Summary & Price Details Glass Box */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] mb-6 space-y-4"
        >
          <h2 className="text-xl font-black text-[#2D3748] dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700">
            Order Summary
          </h2>

          <div className="space-y-3">
            {cartDetails.map((item, idx) => {
              const { discountedPrice, saved } = getDiscountedPrice(item.price, item.discount);
              const shouldAnimate = highlightedItems?.includes(item?.id);

              return (
                <div
                  key={item.id || idx}
                  className={`pb-3 border-b border-dashed border-gray-200 dark:border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition rounded-xl p-2 ${
                    shouldAnimate ? "animate-pulse ring-2 ring-red-500 bg-red-500/10" : ""
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2D3748] dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.selectedQuantity} {item.quantityUnit} ×{" "}
                      <span className="line-through text-gray-400 mr-1">
                        &#8377;{formatNumberWithCommas(item?.price)}
                      </span>
                      <span className="text-[#00B894] font-bold">
                        &#8377;{formatNumberWithCommas(discountedPrice)}
                      </span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-black text-sm text-[#2D3748] dark:text-white">
                      &#8377;{formatNumberWithCommas(discountedPrice * item.selectedQuantity)}
                    </p>
                    {saved > 0 && (
                      <p className="text-[11px] text-[#00B894] font-bold">
                        Saved &#8377;{formatNumberWithCommas(saved * item.selectedQuantity)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-gray-500 dark:text-gray-400">
              <span>Total MRP</span>
              <span>&#8377;{formatNumberWithCommas(subtotal)}</span>
            </div>

            {totalSaving > 0 && (
              <div className="flex justify-between font-bold text-[#00B894]">
                <span>You Saved</span>
                <span>- &#8377;{formatNumberWithCommas(totalSaving)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-black text-[#6C5CE7] dark:text-purple-400 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
              <span>Final Payable</span>
              <span>&#8377;{formatNumberWithCommas(totalAmount)}</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Action Navigation Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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

      <SavedAddressList open={addressListOpen} handleDialogStatus={setAddressListOpen} />

      <Dialog
        open={editAddressModal && !!editingAddress}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            className: "!relative !bg-white dark:!bg-gray-900 !rounded-2xl !shadow-xl !w-full !max-w-xl"
          },
          backdrop: {
            className: "!bg-black/40 !backdrop-blur-sm"
          }
        }}
        keepMounted
        onClose={() => setEditAddressModal(false)}
      >
        {editingAddress && (
          <EditAddressModel
            selectedAddress={editingAddress}
            setEditModal={setEditAddressModal}
            editAddress={handleSaveEditedAddress}
            setSelectedAddress={setEditingAddress}
            loading={editAddressLoading}
          />
        )}
      </Dialog>
    </>
  );
}
