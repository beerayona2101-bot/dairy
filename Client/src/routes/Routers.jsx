import React, { lazy, Suspense, useContext, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import BuffaloLoader from "../components/BuffaloLoader";
import { AdminProtectedRoute, UserProtectedRoute } from "../components/ProtectedRoute";
import { AdminAuthContext, UserAuthContext } from "../context/AuthProvider";
import { socket } from "../socket/socket";

// Core Layout & Main User Pages loaded directly for instant 0ms tab switching
import Layout from "../layouts/Layout";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import ProductPage from "../pages/ProductPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import ContactPage from "../pages/ContactPage";
import OrderCheckoutPage from "../pages/OrderCheckoutPage";

// Lazy loaded secondary layout components
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const UserProfileLayout = lazy(() => import("../layouts/UserProfileLayout"));
const LoginDialog = lazy(() => import("../pages/Auth/User/LoginDialog"));

// Secondary & Admin Pages lazy loaded for code splitting
const UserLogin = lazy(() => import("../pages/Auth/User/UserLogin"));
const UserSignUp = lazy(() => import("../pages/Auth/User/UserSignUp"));
const AdminLogin = lazy(() => import("../pages/Auth/Admin/AdminLogin"));
const OtpVerification = lazy(() => import("../pages/Auth/User/OtpVerification"));
const ProfileInfoInput = lazy(() => import("../pages/Auth/User/ProfileInfoInput"));
const ForgetPassword = lazy(() => import("../pages/Auth/User/ForgetPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/User/ResetPassword"));

// User Profile pages
const AccountInfo = lazy(() => import("../pages/UserProfile/AccountInfo"));
const MyAddresses = lazy(() => import("../pages/UserProfile/MyAddresses"));
const MyOrders = lazy(() => import("../pages/UserProfile/MyOrders"));
const MyWishlist = lazy(() => import("../pages/UserProfile/MyWishlist"));
const Payments = lazy(() => import("../pages/UserProfile/Payments"));
const InvoiceViewPage = lazy(() => import("../pages/InvoiceViewPage"));

// Admin pages
const Inventory = lazy(() => import("../pages/Admin/Inventory"));
const CategoriesPage = lazy(() => import("../pages/Admin/CategoriesPage"));
const ProductsPage = lazy(() => import("../pages/Admin/ProductsPage"));
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const Revenue = lazy(() => import("../pages/Admin/Revenue"));
const AdminEnquiries = lazy(() => import("../pages/Admin/AdminEnquiries"));
const Reports = lazy(() => import("../pages/Admin/Reports"));
const Orders = lazy(() => import("../pages/Admin/Orders"));
const Stores = lazy(() => import("../pages/Admin/Stores"));
const CustomerDetailsPage = lazy(() => import("../pages/Admin/CustomerDetailsPage"));
const AdminProfile = lazy(() => import("../pages/Admin/AdminProfile"));
const PageContentManager = lazy(() => import("../pages/Admin/PageContentManager"));

const PageLoader = () => (
  <BuffaloLoader variant="full" text="Loading Natural Milk Dairy..." />
);

// Graceful Error Boundary so page crashes never freeze navigation
class RouteErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Route Error Boundary caught failure:", error, errorInfo);
        try {
            window.__LAST_ROUTE_ERROR__ = {
                message: error?.message,
                stack: error?.stack,
                componentStack: errorInfo?.componentStack
            };
        } catch {}
    }
    render() {
        if (this.state.hasError) {
            const errStr = this.state.error ? (this.state.error.stack || this.state.error.message || String(this.state.error)) : "Unknown Error";
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center">
                    <h2 className="text-2xl font-black mb-2 text-[#0756B5]">Page loading issue encountered.</h2>
                    <p className="text-sm text-slate-300 mb-4">Click below to refresh and load cleanly.</p>
                    
                    <div className="max-w-3xl w-full my-4 p-4 bg-red-950/90 border-2 border-red-500 rounded-xl text-left overflow-auto text-xs font-mono text-red-200 shadow-2xl">
                        <p className="font-bold text-red-400 mb-2 text-sm">Error Detail: {this.state.error?.message || "Error caught"}</p>
                        <pre className="whitespace-pre-wrap select-all max-h-60 overflow-y-auto">{errStr}</pre>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="px-6 py-2.5 rounded-full bg-[#0756B5] hover:bg-blue-600 text-white font-black text-sm cursor-pointer shadow-md transition-all hover:scale-105"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.href = "/";
                            }}
                            className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm cursor-pointer shadow-md transition-all hover:scale-105"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function Routers() {
    const location = useLocation();
    const { authUser } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);

    // Instant Scroll To Top whenever location changes so pages open cleanly at top
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [location.pathname, location.search]);

    useEffect(() => {
        const registerUser = () => {
            if (authUser?._id) {
                socket.emit("user:register", { userId: authUser._id });
            }
        };

        registerUser();
        socket.on("connect", registerUser);

        return () => {
            socket.off("connect", registerUser);
        };
    }, [authUser]);

    useEffect(() => {
        const registerAdmin = () => {
            if (authAdmin?._id) {
                socket.emit("admin:register", { adminId: authAdmin._id });
            }
        };

        registerAdmin();
        socket.on("connect", registerAdmin);

        return () => {
            socket.off("connect", registerAdmin);
        };
    }, [authAdmin]);

    return (
        <RouteErrorBoundary>
            <Suspense fallback={<PageLoader />}>
                <Routes location={location}>
                    <Route path="/" element={<Layout><HomePage /></Layout>} />
                    <Route path="/home" element={<Layout><HomePage /></Layout>} />

                    <Route path="/login" element={<UserLogin />} />
                    <Route path="/login/forget-password" element={<ForgetPassword />} />
                    <Route path="/login/reset-password" element={<ResetPassword />} />
                    <Route path="/signup" element={<UserSignUp />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route path="/signup/otp-verification" element={<OtpVerification />} />
                    <Route path="/signup/info-input" element={<ProfileInfoInput />} />
                    
                    {/* Protected User Profile Routes */}
                    <Route path="/user-profile/dashboard" element={<Navigate to="/user-profile" replace />} />
                    <Route path="/user-profile" element={<UserProtectedRoute><UserProfileLayout><AccountInfo /></UserProfileLayout></UserProtectedRoute>} />
                    <Route path="/user-profile/addresses" element={<UserProtectedRoute><UserProfileLayout><MyAddresses /></UserProfileLayout></UserProtectedRoute>} />
                    <Route path="/user-profile/orders" element={<UserProtectedRoute><UserProfileLayout><MyOrders /></UserProfileLayout></UserProtectedRoute>} />
                    <Route path="/user-profile/wishlist" element={<UserProtectedRoute><UserProfileLayout><MyWishlist /></UserProfileLayout></UserProtectedRoute>} />
                    <Route path="/wishlist" element={<Layout><MyWishlist /></Layout>} />
                    <Route path="/user-profile/payments" element={<UserProtectedRoute><UserProfileLayout><Payments /></UserProfileLayout></UserProtectedRoute>} />
                    <Route path="/user-profile/invoice/:orderId" element={<UserProtectedRoute><InvoiceViewPage /></UserProtectedRoute>} />
                    <Route path="/invoice/:orderId" element={<UserProtectedRoute><InvoiceViewPage /></UserProtectedRoute>} />

                    {/* Protected Admin Routes */}
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><Dashboard /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/revenue" element={<AdminProtectedRoute><AdminLayout><Revenue /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/reports" element={<AdminProtectedRoute><AdminLayout><Reports /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/enquiries" element={<AdminProtectedRoute><AdminLayout><AdminEnquiries /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/profile" element={<AdminProtectedRoute><AdminLayout><AdminProfile /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/categories" element={<AdminProtectedRoute><AdminLayout><CategoriesPage /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/products" element={<AdminProtectedRoute><AdminLayout><ProductsPage /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/inventory" element={<AdminProtectedRoute><AdminLayout><Inventory /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/page-content" element={<AdminProtectedRoute><AdminLayout><PageContentManager /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/orders" element={<AdminProtectedRoute><AdminLayout><Orders /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/customers" element={<AdminProtectedRoute><AdminLayout><Stores /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/customers/:userId" element={<AdminProtectedRoute><AdminLayout><CustomerDetailsPage /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/customers/:userId/details" element={<AdminProtectedRoute><AdminLayout><CustomerDetailsPage /></AdminLayout></AdminProtectedRoute>} />
                    <Route path="/admin/customers/:userId/orders-History" element={<AdminProtectedRoute><AdminLayout><CustomerDetailsPage /></AdminLayout></AdminProtectedRoute>} />

                    <Route path="/about" element={<Layout><AboutPage /></Layout>} />
                    <Route path="/products/:productId?" element={<Layout><ProductPage /></Layout>} />
                    <Route path="/product-details/:productId?" element={<Layout><ProductDetailsPage /></Layout>} />

                    <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                    <Route path="/order-checkout" element={<Layout><OrderCheckoutPage /></Layout>} />

                    <Route path="/contact-us" element={<Layout><ContactPage /></Layout>} />
                    <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                    <Route path="/contactus" element={<Layout><ContactPage /></Layout>} />
                    <Route path="/product" element={<Navigate to="/products" replace />} />
                    <Route path="/product/:productId?" element={<Navigate to="/products" replace />} />
                    <Route path="/product-detail/:productId?" element={<Navigate to="/product-details" replace />} />

                    <Route path="*" element={<Navigate to={authAdmin ? "/admin/dashboard" : "/home"} replace />} />
                </Routes>
                <LoginDialog />
            </Suspense>
        </RouteErrorBoundary>
    );
}
