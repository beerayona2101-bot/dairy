import React, { useState, useEffect, useContext } from "react";
import {
    MdDashboard,
    MdOutlineAccountCircle,
    MdLocationOn,
    MdShoppingCart,
    MdFavorite,
    MdPayment,
    MdArrowForward,
    MdInfo,
    MdHeadphones,
    MdHelpOutline,
} from "react-icons/md";
import CircularProgress from "@mui/material/CircularProgress";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AdminAuthContext, UserAuthContext } from "../context/AuthProvider";
import { ThemeContext } from "../context/ThemeProvider";
import { updateUserProfilePhoto } from "../services/userProfileService";
import { enqueueSnackbar } from "notistack";
import { LanguagesIcon } from "lucide-react";

export default function UserProfileSidebar() {

    const location = useLocation();
    const navigate = useNavigate();

    const { authUser, setAuthUser, handleUserLogout, setOpenLoginDialog, requestLogout } = useContext(UserAuthContext);
    const { authAdmin, handleAdminLogout } = useContext(AdminAuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    const [selectedFile, setSelectedFile] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(authUser?.photo || (authAdmin ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" : ""));
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showUpdateButton, setShowUpdateButton] = useState(false);

    useEffect(() => {
        if (authUser?.photo) {
            setPhotoUrl(authUser?.photo);
        } else if (authAdmin) {
            setPhotoUrl("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
        }
    }, [authUser, authAdmin]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPhotoUrl(URL.createObjectURL(file));
            setShowUpdateButton(true);
        }
    };

    const handleProfileImageChange = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append("photo", selectedFile);
        formData.append("id", authUser?._id);

        try {
            const res = await updateUserProfilePhoto(formData, (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
            });

            if (res?.success) {
                enqueueSnackbar("Profile photo updated!", { variant: "success" });
                setAuthUser((prev) => ({ ...prev, photo: res.updatedPhoto }));
            } else {
                enqueueSnackbar("Failed to update photo.", { variant: "error" });
            }
        } catch (err) {
            enqueueSnackbar(err?.response?.data?.message || "Something went wrong.", { variant: "error" });
        } finally {
            setLoading(false);
            setUploadProgress(0);
            setShowUpdateButton(false);
        }
    };

    const handleLogout = () => {
        if (requestLogout) {
            requestLogout(authAdmin ? "admin" : "user");
        } else if (authAdmin) {
            handleAdminLogout();
            enqueueSnackbar("Admin Logged Out Successfully", { variant: "info" });
            navigate("/", { replace: true });
        } else {
            handleUserLogout();
            enqueueSnackbar("User Logged Out Successfully", { variant: "success" });
            navigate("/", { replace: true });
        }
    };

    const navigationLinks = [
        { key: "/user-profile/dashboard", icon: <MdDashboard />, label: "Dashboard" },
        { key: "/user-profile", icon: <MdOutlineAccountCircle />, label: "My Profile" },
        { key: "/user-profile/orders", icon: <MdShoppingCart />, label: "My Orders" },
        { key: "/user-profile/addresses", icon: <MdLocationOn />, label: "Saved Addresses" },
        { key: "/user-profile/wishlist", icon: <MdFavorite />, label: "My Wishlist" },
        { key: "/user-profile/payments", icon: <MdPayment />, label: "Payments" },
        { key: "/about", icon: <MdInfo />, label: "About Us" },
        { key: "/contact-us", icon: <MdHeadphones />, label: "Contact Us" },
        { key: "/faqs", icon: <MdHelpOutline />, label: "FAQs" },
    ];

    const isLinkActive = (key) => {
        if (key === "/user-profile") {
            return location?.pathname === "/user-profile" || location?.pathname === "/user-profile/";
        }
        return location?.pathname === key;
    };

    return (
        <aside className="scrollbar-hide w-full h-full bg-white dark:bg-gray-800 backdrop-blur-[20px] p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col justify-between overflow-y-auto transition-all duration-300 font-dashboard rounded-[24px] border border-gray-200/90 dark:border-gray-700/80">
            <div>
                <nav className="space-y-1.5">
                    {navigationLinks.map((item) => {
                        const active = isLinkActive(item.key);
                        return (
                            <Link
                                key={item.key}
                                to={item.key}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left rounded-xl text-xs font-bold tracking-tight transition-all duration-200 ${active ? "bg-[#075C2A] text-white shadow-md shadow-emerald-500/20" : "hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[#4A5568] dark:text-gray-300"}`}
                            >
                                <span className="text-base">{item.icon}</span> {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="pt-4 mt-6 space-y-1.5 border-t border-gray-100 dark:border-gray-700/60">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#718096] dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                >
                    <div className="flex items-center gap-2.5">
                        <span className="text-sm">{theme === 'light' ? '🌙' : '☀️'}</span>
                        <span>{theme === 'light' ? 'Dark Theme' : 'Light Theme'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-gray-100 dark:bg-gray-700">
                        {theme === 'light' ? 'OFF' : 'ON'}
                    </span>
                </button>

                {(authUser || authAdmin) ? (
                  <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 transition cursor-pointer"
                  >
                      <span>Log out</span>
                      <MdArrowForward className="text-sm" />
                  </button>
                ) : (
                  <button
                      onClick={() => navigate("/login")}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#075C2A] to-[#054593] shadow-md hover:opacity-95 transition cursor-pointer"
                  >
                      <span>Sign In / Create Account</span>
                      <MdArrowForward className="text-sm" />
                  </button>
                )}
            </div>
        </aside>
    );
};
