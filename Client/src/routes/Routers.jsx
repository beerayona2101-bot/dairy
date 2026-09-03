import React, { lazy, Suspense, useContext, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import BuffaloLoader from "../components/BuffaloLoader";
import Layout from "../layouts/Layout";
import AdminLayout from "../layouts/AdminLayout";
import UserProfileLayout from "../layouts/UserProfileLayout";
import { AnimatePresence } from "framer-motion";
import { AdminAuthContext, UserAuthContext } from "../context/AuthProvider";
import { socket } from "../socket/socket";
import LoginDialog from "../pages/Auth/User/LoginDialog";

// Lazy loaded page components for fast initial load & code splitting
const LandingPage = lazy(() => import("../pages/LandingPage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ProductPage = lazy(() => import("../pages/ProductPage"));
const ProductDetailsPage = lazy(() => import("../pages/ProductDetailsPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const OrderCheckoutPage = lazy(() => import("../pages/OrderCheckoutPage"));

// Auth pages
const UserLogin = lazy(() => import("../pages/Auth/User/UserLogin"));
const UserSignUp = lazy(() => import("../pages/Auth/User/UserSignUp"));
const AdminLogin = lazy(() => import("../pages/Auth/Admin/AdminLogin"));
const OtpVerification = lazy(() => import("../pages/Auth/User/OtpVerification"));
const ProfileInfoInput = lazy(() => import("../pages/Auth/User/ProfileInfoInput"));
const ForgetPassword = lazy(() => import("../pages/Auth/User/ForgetPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/User/ResetPassword"));

// User Profile pages
const UserDashboard = lazy(() => import("../pages/UserProfile/UserDashboard"));
const AccountInfo = lazy(() => import("../pages/UserProfile/AccountInfo"));
const MyAddresses = lazy(() => import("../pages/UserProfile/MyAddresses"));
const MyOrders = lazy(() => import("../pages/UserProfile/MyOrders"));
const MyWishlist = lazy(() => import("../pages/UserProfile/MyWishlist"));
const Payments = lazy(() => import("../pages/UserProfile/Payments"));

const Inventory = lazy(() => import("../pages/Admin/Inventory"));
const CategoriesPage = lazy(() => import("../pages/Admin/CategoriesPage"));
const ProductsPage = lazy(() => import("../pages/Admin/ProductsPage"));

// Admin pages
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const Revenue = lazy(() => import("../pages/Admin/Revenue"));
const AdminEnquiries = lazy(() => import("../pages/Admin/AdminEnquiries"));
const Reports = lazy(() => import("../pages/Admin/Reports"));
const Orders = lazy(() => import("../pages/Admin/Orders"));
const Stores = lazy(() => import("../pages/Admin/Stores"));
const StoreOrdersHistory = lazy(() => import("../pages/Admin/StoreOrdersHistory"));
const AdminProfile = lazy(() => import("../pages/Admin/AdminProfile"));
const PageContentManager = lazy(() => import("../pages/Admin/PageContentManager"));

const PageLoader = () => (
  <BuffaloLoader variant="full" text="Loading Madhur Dairy..." />
);

export default function Routers() {
    const location = useLocation();
    const localUser = localStorage.getItem("User");
    const { authUser } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);

    useEffect(() => {
        if (!authUser?._id) return;
        socket.emit("user:register", { userId: authUser?._id });
    }, [authUser]);

    useEffect(() => {
        if (!authAdmin?._id) return;
        socket.emit("admin:register", { adminId: authAdmin?._id });
    }, [authAdmin]);

    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoader />}>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Layout><HomePage /></Layout>} />
                    <Route path="/home" element={<Layout><HomePage /></Layout>} />

                    <Route path="/login" element={<UserLogin />} />
                    <Route path="/login/forget-password" element={<ForgetPassword />} />
                    <Route path="/login/reset-password" element={<ResetPassword />} />
                    <Route path="/signup" element={<UserSignUp />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route path="/signup/otp-verification" element={<OtpVerification />} />
                    <Route path="/signup/info-input" element={<ProfileInfoInput />} />
                    <Route path="/user-profile/dashboard" element={<UserProfileLayout><UserDashboard /></UserProfileLayout>} />
                    <Route path="/user-profile" element={<UserProfileLayout><AccountInfo /></UserProfileLayout>} />
                    <Route path="/user-profile/addresses" element={<UserProfileLayout><MyAddresses /></UserProfileLayout>} />
                    <Route path="/user-profile/orders" element={<UserProfileLayout><MyOrders /></UserProfileLayout>} />
                    <Route path="/user-profile/wishlist" element={<UserProfileLayout><MyWishlist /></UserProfileLayout>} />
                    <Route path="/wishlist" element={<Layout><MyWishlist /></Layout>} />
                    <Route path="/user-profile/payments" element={<UserProfileLayout><Payments /></UserProfileLayout>} />

                    <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
                    <Route path="/admin/revenue" element={<AdminLayout><Revenue /></AdminLayout>} />
                    <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />
                    <Route path="/admin/enquiries" element={<AdminLayout><AdminEnquiries /></AdminLayout>} />
                    <Route path="/admin/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
                    <Route path="/admin/categories" element={<AdminLayout><CategoriesPage /></AdminLayout>} />
                    <Route path="/admin/products" element={<AdminLayout><ProductsPage /></AdminLayout>} />
                    <Route path="/admin/inventory" element={<AdminLayout><Inventory /></AdminLayout>} />
                    <Route path="/admin/page-content" element={<AdminLayout><PageContentManager /></AdminLayout>} />
                    <Route path="/admin/orders" element={<AdminLayout><Orders /></AdminLayout>} />
                    <Route path="/admin/customers" element={<AdminLayout><Stores /></AdminLayout>} />
                    <Route path="/admin/customers/:userId/orders-History" element={<AdminLayout><StoreOrdersHistory /></AdminLayout>} />

                    <Route path="/about" element={<Layout><AboutPage /></Layout>} />
                    <Route path="/products/:productId?" element={<Layout><ProductPage /></Layout>} />
                    <Route path="/product-details/:productId?" element={<Layout><ProductDetailsPage /></Layout>} />

                    <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                    <Route path="/order-checkout" element={<Layout><OrderCheckoutPage /></Layout>} />

                    <Route path="/contact-us" element={<Layout><ContactPage /></Layout>} />

                    <Route path="*" element={<Navigate to={localUser ? "/home" : "/login"} replace />} />
                </Routes>
            </Suspense>

            <LoginDialog />
        </AnimatePresence>
    );
}