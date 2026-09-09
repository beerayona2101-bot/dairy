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
} from "react-icons/md";
import CircularProgress from "@mui/material/CircularProgress";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AdminAuthContext, UserAuthContext } from "../context/AuthProvider";
import { ThemeContext } from "../context/ThemeProvider";
import { updateUserProfilePhoto } from "../services/userProfileService";
import { enqueueSnackbar } from "notistack";
import { LanguagesIcon } from "lucide-react";

export default function UserProfileSidebar({ userProfileDrawer, setUserProfileDrawer }) {

    const location = useLocation();
    const navigate = useNavigate();

    const { authUser, setAuthUser, handleUserLogout, setOpenLoginDialog } = useContext(UserAuthContext);
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
        if (authAdmin) {
            handleAdminLogout();
            enqueueSnackbar("Admin Logged Out Successfully", { variant: "info" });
        } else {
            handleUserLogout();
            enqueueSnackbar("User Logged Out Successfully", { variant: "success" });
        }
        navigate("/");
        if (setOpenLoginDialog) setOpenLoginDialog(true);
        if (setUserProfileDrawer) setUserProfileDrawer(false);
    }

    const navigationLinks = [
        { key: "/user-profile", icon: <MdOutlineAccountCircle />, label: "My Profile" },
        { key: "/user-profile/orders", icon: <MdShoppingCart />, label: "My Orders" },
        { key: "/user-profile/addresses", icon: <MdLocationOn />, label: "Saved Addresses" },
        { key: "/user-profile/wishlist", icon: <MdFavorite />, label: "My Wishlist" },
        { key: "/about", icon: <MdInfo />, label: "About Us" },
        { key: "/contact-us", icon: <MdHeadphones />, label: "Contact Us" },
    ];

    return (
        <aside className={`scrollbar-hide w-full h-full bg-white dark:bg-gray-800 backdrop-blur-[20px] p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col justify-between overflow-y-auto transition-all duration-300 ${userProfileDrawer ? "rounded-l-none rounded-r-[24px] border-y border-r border-l-0 border-gray-200 dark:border-gray-700/80" : "rounded-[24px] border border-gray-200/90 dark:border-gray-700/80"}`}>
            <div>
                <div className="flex flex-col items-center mb-4 relative group">
                    <div className="relative w-20 h-20">
                        <img
                            src={photoUrl || null}
                            alt={photoUrl}
                            className="rounded-full w-20 h-20 object-cover border-2 border-purple-100 dark:border-gray-700 shadow-sm"
                        />

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                <CircularProgress
                                    variant="determinate"
                                    value={uploadProgress}
                                    size={52}
                                    thickness={4}
                                    style={{ color: "#fff" }}
                                />
                            </div>
                        )}

                        <label
                            htmlFor="profileImageInput"
                            className={`absolute bottom-0 right-0 bg-[#6C5CE7] text-white p-1.5 rounded-full shadow-md transition ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#5b4cc4]"}`}
                            title="Edit Photo"
                        >
                            <i className="fa-solid fa-pen-to-square text-[10px]" />
                        </label>

                        <input
                            type="file"
                            id="profileImageInput"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                            disabled={loading}
                        />
                    </div>

                    {showUpdateButton && (
                        <button
                            onClick={handleProfileImageChange}
                            disabled={loading}
                            className={`mt-2.5 px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white shadow-xs"}`}
                        >
                            {loading ? (
                                <>
                                    <span>Updating</span>
                                    <CircularProgress size={14} color="inherit" />
                                </>
                            ) : (
                                "Update Photo"
                            )}
                        </button>
                    )}

                    <h2 className="text-base font-extrabold mt-2 text-[#2D3748] dark:text-white tracking-tight text-center">
                        {authAdmin ? (authAdmin?.name || "Madhur Admin") : `${authUser?.firstName || ""} ${authUser?.lastName || ""}`}
                    </h2>
                </div>

                <nav className="mt-4 space-y-1.5">
                    {navigationLinks.map((item) => (
                        <Link
                            key={item.key}
                            to={item.key}
                            onClick={userProfileDrawer ? () => setUserProfileDrawer(false) : null}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left rounded-xl text-xs font-bold transition-all duration-200 ${location?.pathname === item.key ? "bg-[#6C5CE7] text-white shadow-md shadow-purple-500/20" : "hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#4A5568] dark:text-gray-300"}`}
                        >
                            <span className="text-base">{item.icon}</span> {item.label}
                        </Link>
                    ))}
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

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 transition cursor-pointer"
                >
                    <span>Log out</span>
                    <MdArrowForward className="text-sm" />
                </button>
            </div>
        </aside>
    );
};
