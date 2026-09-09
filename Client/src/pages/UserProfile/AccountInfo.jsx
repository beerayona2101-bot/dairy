import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser, FaPhone, FaVenusMars, FaMapMarkerAlt, FaEdit,
  FaRoad, FaCity, FaMapPin, FaEnvelope, FaTrashAlt, FaCamera,
} from "react-icons/fa";
import { Close } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import { Navigation, Info, Headphones, ChevronRight, Sparkles, ShoppingBag, MapPin, Heart, CreditCard, LayoutDashboard } from "lucide-react";
import BuffaloLoader from "../../components/BuffaloLoader";
import { UserAuthContext } from "../../context/AuthProvider";
import { getUserProfile, updateUserProfile, deleteUserAccount, updateUserProfilePhoto } from "../../services/userProfileService";
import { useSnackbar } from "notistack";
import { formatFullAddress } from "../../utils/dateUtils";
import { fetchPincodeDetails } from "../../services/pincodeService";
import LocationPickerModal from "../../components/LocationPickerModal";

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AccountInfo() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { authUser, setAuthUser, handleUserLogout } = useContext(UserAuthContext);

  const [edit, setEdit] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [showPhotoUpdateBtn, setShowPhotoUpdateBtn] = useState(false);

  const [pinLoading, setPinLoading] = useState(false);
  const [pinStatusMsg, setPinStatusMsg] = useState("");
  const [localities, setLocalities] = useState([]);

  const [editData, setEditData] = useState({
    _id: authUser?._id,
    firstName: "",
    lastName: "",
    email: "",
    address: {
      houseNo: "",
      streetAddress: "",
      village: "",
      landmark: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },
    gender: "",
    mobileNo: "",
    photo: "",
    username: "",
  });

  const handleLocationPicked = (loc) => {
    setEditData((prev) => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        streetAddress: loc.streetAddress || prev.address?.streetAddress || "",
        village: loc.village || prev.address?.village || "",
        city: loc.city || prev.address?.city || "",
        district: loc.district || prev.address?.district || "",
        state: loc.state || prev.address?.state || "",
        pincode: loc.pincode || prev.address?.pincode || "",
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
    }));
    setPinStatusMsg(`Map location set: ${loc.city || loc.state}`);
  };

  const handlePincodeAutoFill = async (val) => {
    setEditData((prev) => ({
      ...prev,
      address: { ...(prev.address || {}), pincode: val },
    }));
    setPinStatusMsg("");

    if (/^\d{6}$/.test(val.trim())) {
      setPinLoading(true);
      const res = await fetchPincodeDetails(val.trim());
      setPinLoading(false);

      if (res?.success) {
        setPinStatusMsg(`Auto-filled: ${res.city}, ${res.state}`);
        const villageList = res.localities || res.villages || [];
        setLocalities(villageList);

        setEditData((prev) => ({
          ...prev,
          address: {
            ...(prev.address || {}),
            city: res.city || prev.address?.city || "",
            district: res.district || res.city || prev.address?.district || "",
            state: res.state || prev.address?.state || "",
            village: prev.address?.village || (villageList.length > 0 ? villageList[0] : ""),
          },
        }));
      } else {
        setPinStatusMsg(res.message || "Pincode lookup unsuccessful");
      }
    } else {
      setLocalities([]);
    }
  };

  const [dbData, setDbData] = useState({});

  const handleUserProfileData = useCallback(async () => {
    try {
      setDataLoading(true);
      const data = await getUserProfile(authUser?._id);
      if (data?.success) {
        setDbData(data?.userData);
      }
    } catch (error) {
      enqueueSnackbar(error?.message || "Error fetching user data", { variant: "error" });
    } finally {
      setDataLoading(false);
    }
  }, [authUser?._id, enqueueSnackbar]);

  useEffect(() => {
    if (authUser?._id) {
      handleUserProfileData();
    }
  }, [authUser?._id, handleUserProfileData]);

  useEffect(() => {
    if (dbData) {
      setEditData({
        firstName: dbData?.firstName || "",
        lastName: dbData?.lastName || "",
        email: dbData?.email || "",
        address: dbData?.address || {},
        gender: dbData?.gender || "",
        mobileNo: dbData?.mobileNo || "",
        photo: dbData?.photo || "",
        username: dbData?.username || "",
      });
    }
  }, [dbData]);

  useEffect(() => {
    if (dbData?.photo || authUser?.photo) {
      setPhotoPreview(dbData?.photo || authUser?.photo);
    } else {
      setPhotoPreview("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
    }
  }, [dbData?.photo, authUser?.photo]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setShowPhotoUpdateBtn(true);
    }
  };

  const handleUploadProfilePhoto = async () => {
    if (!selectedPhotoFile) return;
    const userId = authUser?._id || dbData?._id;
    if (!userId) {
      enqueueSnackbar("User ID missing. Please refresh.", { variant: "error" });
      return;
    }

    setPhotoLoading(true);
    const formData = new FormData();
    formData.append("photo", selectedPhotoFile);
    formData.append("id", userId);

    try {
      const res = await updateUserProfilePhoto(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setPhotoUploadProgress(percentCompleted);
      });

      if (res?.success) {
        enqueueSnackbar("Profile photo updated successfully!", { variant: "success" });
        if (setAuthUser) {
          setAuthUser((prev) => ({ ...prev, photo: res.updatedPhoto }));
        }
        setDbData((prev) => ({ ...prev, photo: res.updatedPhoto }));
        setShowPhotoUpdateBtn(false);
      } else {
        enqueueSnackbar("Failed to update photo.", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Error uploading photo.", { variant: "error" });
    } finally {
      setPhotoLoading(false);
      setPhotoUploadProgress(0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateInputs = () => {
    const { firstName, lastName, email, gender, mobileNo, username, address } = editData;
    return (
      !!firstName &&
      !!lastName &&
      !!email &&
      !!gender &&
      !!mobileNo &&
      !!username &&
      !!address?.streetAddress &&
      !!address?.city &&
      !!address?.pincode
    );
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      enqueueSnackbar("Please fill out all required fields", { variant: "warning" });
      return;
    }

    try {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(editData.mobileNo)) {
        enqueueSnackbar("Enter a valid 10-digit phone number", { variant: "error" });
        return;
      }

      setIsLoading(true);
      const res = await updateUserProfile(editData, authUser?._id);
      if (res?.success) {
        await handleUserProfileData();
        setEdit(false);
        enqueueSnackbar("Profile edited successfully", { variant: "success" });
      } else {
        enqueueSnackbar("Update failed", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong.", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const targetUserId = authUser?._id || dbData?._id;
    const targetEmail = authUser?.email || dbData?.email;

    if (!targetUserId && !targetEmail) {
      enqueueSnackbar("User information missing. Please refresh and try again.", { variant: "error" });
      return;
    }

    try {
      setIsDeleting(true);
      const res = await deleteUserAccount(targetUserId, targetEmail);
      if (res?.success) {
        enqueueSnackbar("Your account has been deleted successfully.", { variant: "info" });
        handleUserLogout();
        localStorage.removeItem("User");
        localStorage.removeItem("deliveryAddress");
        localStorage.removeItem("tempUserData");
        navigate("/login");
      } else {
        enqueueSnackbar(res?.message || "Failed to delete account.", { variant: "error" });
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err?.response?.data?.message || "Error deleting account.", { variant: "error" });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  let content;

  if (dataLoading) {
    content = <BuffaloLoader variant="inline" text="Loading account info..." />;
  } else {
    content = (
      <>
        {!edit ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Person Profile Header Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-blue-50/60 dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 border border-purple-100 dark:border-purple-800/40 rounded-2xl sm:rounded-3xl flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                  <img
                    src={photoPreview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt="Profile Photo"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-4 border-white dark:border-slate-700 shadow-md"
                  />
                </div>
                <div>
                  <h4 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    {dbData?.firstName || authUser?.firstName || "User"} {dbData?.lastName || authUser?.lastName || ""}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-[#1E88E5] dark:text-blue-400 mt-0.5">
                    @{dbData?.username || authUser?.username || "username"}
                  </p>
                  {(dbData?.email || authUser?.email) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <FaEnvelope className="text-[10px] text-gray-400" />
                      {dbData?.email || authUser?.email}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEdit(true)}
                className="shrink-0 p-2 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 text-[#6C5CE7] dark:text-purple-300 hover:bg-[#6C5CE7] hover:text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FaEdit />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            </div>

            {/* Desktop Only: Full Personal Details Summary (Hidden on Mobile) */}
            <div className="hidden md:block">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
                Personal Details Overview
              </h4>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-gray-50/90 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                    <FaUser className="text-[#1E88E5]" /> First Name
                  </span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{dbData?.firstName || "N/A"}</p>
                </div>

                <div className="p-3.5 bg-gray-50/90 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                    <FaUser className="text-[#1E88E5]" /> Last Name
                  </span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{dbData?.lastName || "N/A"}</p>
                </div>

                <div className="p-3.5 bg-gray-50/90 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                    <FaPhone className="text-[#1E88E5]" /> Phone Number
                  </span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{dbData?.mobileNo || "N/A"}</p>
                </div>

                <div className="p-3.5 bg-gray-50/90 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                    <FaVenusMars className="text-[#1E88E5]" /> Gender
                  </span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{dbData?.gender || "N/A"}</p>
                </div>

                <div className="col-span-2 p-3.5 bg-gray-50/90 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                    <FaMapMarkerAlt className="text-[#1E88E5]" /> Primary Delivery Address
                  </span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                    {formatFullAddress(dbData?.address) || "No address saved"}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Quick Options Menu Cards (Prominent on Mobile) */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#6C5CE7]" />
                Account Menu Options
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dashboard Overview Menu Option */}
                <div
                  onClick={() => navigate("/user-profile/dashboard")}
                  className="p-4 bg-white dark:bg-slate-800/90 border border-gray-200/90 dark:border-gray-700/80 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <LayoutDashboard size={22} />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        Dashboard Overview
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        View account stats & activity summary
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* My Orders Menu Option */}
                <div
                  onClick={() => navigate("/user-profile/orders")}
                  className="p-4 bg-white dark:bg-slate-800/90 border border-gray-200/90 dark:border-gray-700/80 hover:border-[#6C5CE7] dark:hover:border-purple-500 rounded-2xl flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-[#6C5CE7] dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-[#6C5CE7] dark:group-hover:text-purple-300 transition-colors">
                        My Orders
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        View & track your past purchases
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-[#6C5CE7] group-hover:translate-x-1 transition-all" />
                </div>

                {/* Saved Addresses Menu Option */}
                <div
                  onClick={() => navigate("/user-profile/addresses")}
                  className="p-4 bg-white dark:bg-slate-800/90 border border-gray-200/90 dark:border-gray-700/80 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-[#1E88E5] dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-[#1E88E5] dark:group-hover:text-blue-300 transition-colors">
                        Saved Addresses
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Manage home & work delivery locations
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-[#1E88E5] group-hover:translate-x-1 transition-all" />
                </div>

                {/* My Wishlist Menu Option */}
                <div
                  onClick={() => navigate("/user-profile/wishlist")}
                  className="p-4 bg-white dark:bg-slate-800/90 border border-gray-200/90 dark:border-gray-700/80 hover:border-pink-500 dark:hover:border-pink-400 rounded-2xl flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-950/70 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Heart size={22} />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">
                        My Wishlist
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Saved items for quick reordering
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Payments Menu Option */}
                <div
                  onClick={() => navigate("/user-profile/payments")}
                  className="p-4 bg-white dark:bg-slate-800/90 border border-gray-200/90 dark:border-gray-700/80 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CreditCard size={22} />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                        Payment Methods
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        UPI & payment history options
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* About Us Menu Option */}
                <div
                  onClick={() => navigate("/about")}
                  className="p-4 bg-white dark:bg-slate-800/90 border border-gray-200/90 dark:border-gray-700/80 hover:border-purple-500 dark:hover:border-purple-400 rounded-2xl flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Info size={22} />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                        About Us
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Learn about MADHU Dairy & quality
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Contact Us Menu Option */}
                <div
                  onClick={() => navigate("/contact-us")}
                  className="p-4 bg-white dark:bg-slate-800/90 border border-gray-200/90 dark:border-gray-700/80 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Headphones size={22} />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                        Contact & Support
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get help & 24/7 customer care
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-4">
            {/* Mobile View Profile Photo Card */}
            <div className="flex items-center justify-between p-3.5 bg-transparent border border-gray-200/80 dark:border-gray-700/80 rounded-2xl mb-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="relative w-16 h-16 shrink-0">
                  <img
                    src={photoPreview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt="Profile Photo"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md"
                  />

                  {photoUploadProgress > 0 && photoUploadProgress < 100 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <CircularProgress
                        variant="determinate"
                        value={photoUploadProgress}
                        size={40}
                        thickness={4}
                        style={{ color: "#fff" }}
                      />
                    </div>
                  )}

                  <label
                    htmlFor="mobileProfileImageInput"
                    className={`absolute bottom-0 right-0 bg-[#1E88E5] text-white p-1.5 rounded-full shadow-md transition ${
                      photoLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#1565C0] active:scale-95"
                    }`}
                    title="Edit Profile Photo"
                  >
                    <FaCamera className="text-[11px]" />
                  </label>

                  <input
                    type="file"
                    id="mobileProfileImageInput"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={photoLoading}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                    {dbData?.firstName || authUser?.firstName || "User"} {dbData?.lastName || authUser?.lastName || ""}
                  </h4>
                  <p className="text-xs text-[#1E88E5] font-semibold mt-0.5">
                    @{dbData?.username || authUser?.username || "username"}
                  </p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 block">
                    Tap camera to change photo
                  </span>
                </div>
              </div>

              {showPhotoUpdateBtn && (
                <button
                  type="button"
                  onClick={handleUploadProfilePhoto}
                  disabled={photoLoading}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs ${
                    photoLoading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-[#1E88E5] hover:bg-[#1565C0] text-white animate-pulse"
                  }`}
                >
                  {photoLoading ? (
                    <>
                      <span>Updating</span>
                      <CircularProgress size={12} color="inherit" />
                    </>
                  ) : (
                    "Save Photo"
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 font-medium flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">First Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded transition focus:ring-2 focus:ring-blue-300 dark:bg-gray-500/50 dark:border-gray-600 text-gray-900 dark:text-white"
                  name="firstName"
                  value={editData?.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="mb-1 font-medium flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">Last Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded transition focus:ring-2 focus:ring-blue-300 dark:bg-gray-500/50 dark:border-gray-600 text-gray-900 dark:text-white"
                  name="lastName"
                  value={editData?.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="mb-1 font-medium flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"><FaEnvelope /> Email Address</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded transition focus:ring-2 focus:ring-blue-300 dark:bg-gray-500/50 dark:border-gray-600 text-gray-900 dark:text-white"
                  name="email"
                  value={editData?.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="mb-1 font-medium flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"><FaUser /> Username</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded transition focus:ring-2 focus:ring-blue-300 dark:bg-gray-500/50 dark:border-gray-600 text-gray-900 dark:text-white"
                  name="username"
                  value={editData?.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 font-medium flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"><FaPhone /> Phone Number</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded transition focus:ring-2 focus:ring-blue-300 dark:bg-gray-500/50 dark:border-gray-600 text-gray-900 dark:text-white"
                  name="mobileNo"
                  value={editData?.mobileNo}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,10}$/.test(val)) handleInputChange(e);
                  }}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 font-medium flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"><FaVenusMars /> Gender</label>
                <select
                  className="w-full p-2 border rounded transition dark:bg-gray-500/50 dark:border-gray-600 text-gray-900 dark:text-white"
                  name="gender"
                  value={editData?.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 font-medium flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"><FaMapMarkerAlt /> Address</label>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="px-3 py-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded transition text-xs font-bold"
                >
                  Edit Address
                </button>
                <p className="text-xs mt-2 text-gray-600 dark:text-gray-300">
                  {formatFullAddress(editData?.address)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className={`mt-4 px-6 py-2 text-white font-bold rounded-xl transition shadow-md ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#1E88E5] hover:bg-[#1565C0]"
              }`}
            >
              {isLoading ? "Saving..." : "Save Account Info"}
            </button>
          </form>
        )}

        {/* Danger Zone: Delete Account */}
        <div className="mt-8 pt-5 border-t border-red-200 dark:border-red-900/40">
          <div className="p-3.5 sm:p-4 bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <FaTrashAlt /> Danger Zone: Delete Account
              </h4>
              <p className="text-[11px] sm:text-xs text-red-600/90 dark:text-red-300/80 mt-1 leading-snug">
                Once deleted, all your address details and preferences will be permanently wiped out.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-md whitespace-nowrap cursor-pointer text-center"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Support & Quick Information Options (About Us & Contact Us - Hidden on Mobile) */}
        <div className="hidden md:block mt-8 pt-6 border-t border-gray-200/90 dark:border-gray-800 space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#6C5CE7] animate-pulse" />
              Quick Support & Information
            </h4>
            <span className="text-[10px] font-bold text-gray-400">Madhu Care</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* About Us Card Option */}
            <Link
              to="/about"
              className="relative overflow-hidden p-4 bg-gradient-to-br from-purple-50/90 via-white to-purple-50/40 dark:from-purple-950/40 dark:via-gray-900 dark:to-purple-950/20 border border-purple-200/90 dark:border-purple-800/70 rounded-2xl flex items-center justify-between gap-3 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#805AD5] text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25 group-hover:scale-110 transition-transform duration-200">
                  <Info size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h5 className="text-sm font-black text-gray-900 dark:text-white group-hover:text-[#6C5CE7] dark:group-hover:text-purple-300 transition-colors">
                      About Us
                    </h5>
                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-purple-100 dark:bg-purple-900/70 text-[#6C5CE7] dark:text-purple-300">
                      Our Story
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-snug">
                    Discover our farm-fresh milk journey & quality standards
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-[#6C5CE7] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>

            {/* Contact Us Card Option */}
            <Link
              to="/contact-us"
              className="relative overflow-hidden p-4 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 dark:from-blue-950/40 dark:via-gray-900 dark:to-blue-950/20 border border-blue-200/90 dark:border-blue-800/70 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-[#1E88E5] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-110 transition-transform duration-200">
                  <Headphones size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h5 className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      Contact Us
                    </h5>
                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-blue-100 dark:bg-blue-900/70 text-blue-600 dark:text-blue-300">
                      24/7 Care
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-snug">
                    Get round-the-clock helpdesk & customer support
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </div>
        </div>

        {/* Edit Address Modal */}
        {showAddressModal && (
          <Dialog
            open={showAddressModal}
            slots={{ transition: Transition }}
            keepMounted
            onClose={() => setShowAddressModal(false)}
            fullWidth
            maxWidth="sm"
          >
            <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setShowAddressModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-xl font-bold transition cursor-pointer"
              >
                <Close />
              </button>

              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
                <FaMapMarkerAlt className="text-[#1E88E5]" /> Edit Delivery Address
              </h2>

              <form className="space-y-3.5 text-xs sm:text-sm">
                <LocationPickerModal
                  isOpen={showMapModal}
                  onClose={() => setShowMapModal(false)}
                  onSelectLocation={handleLocationPicked}
                  initialLocation={
                    editData?.address?.latitude && editData?.address?.longitude
                      ? { lat: editData.address.latitude, lng: editData.address.longitude }
                      : null
                  }
                />

                {/* Choose Location on Map Action Button */}
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-[#1E88E5] hover:from-blue-700 hover:to-[#1565C0] text-white py-3 px-4 rounded-xl shadow-md font-extrabold text-xs sm:text-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.01] cursor-pointer mb-2"
                >
                  <Navigation className="w-4.5 h-4.5 animate-bounce" />
                  Choose / Pin Location on Interactive Map
                </button>

                {/* Pincode & Auto Fill Notification */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-700 dark:text-gray-200">Pincode *</label>
                    {pinLoading && (
                      <span className="text-xs text-[#1E88E5] font-semibold animate-pulse">
                        Auto-detecting City & State...
                      </span>
                    )}
                    {pinStatusMsg && !pinLoading && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ {pinStatusMsg}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode (e.g. 534004 or 422010)"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.pincode || ""}
                    onChange={(e) => handlePincodeAutoFill(e.target.value)}
                  />
                </div>

                {/* Auto-filled State & City / District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">State *</label>
                    <input
                      type="text"
                      placeholder="State (Auto-filled)"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editData?.address?.state || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: { ...(prev.address || {}), state: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">City / District *</label>
                    <input
                      type="text"
                      placeholder="City / District (Auto-filled)"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editData?.address?.city || editData?.address?.district || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: {
                            ...(prev.address || {}),
                            city: e.target.value,
                            district: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Village / Area / Locality */}
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">Village / Locality</label>
                  <input
                    type="text"
                    placeholder="Enter Village or Locality (e.g. Chataparru or Ambad)"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.village || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), village: e.target.value },
                      }))
                    }
                  />

                  {localities.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold text-[#1E88E5] dark:text-blue-400 block mb-1">
                        Select Village / Post Office:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {localities.slice(0, 8).map((loc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setEditData((prev) => ({
                                ...prev,
                                address: { ...(prev.address || {}), village: loc },
                              }))
                            }
                            className={`px-2.5 py-1 text-xs rounded-full border font-medium transition cursor-pointer ${
                              editData?.address?.village === loc
                                ? "bg-[#1E88E5] text-white border-[#1E88E5]"
                                : "bg-blue-50 hover:bg-blue-100 text-[#1E88E5] border-blue-200"
                            }`}
                          >
                            + {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* House No / Building Name */}
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                    House No. / Door No. / Building Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8-137 or Flat 101"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.hno || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), hno: e.target.value },
                      }))
                    }
                  />
                </div>

                {/* Street Address */}
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">Street Address / Landmark *</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Milk Dairy, Main Road"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.streetAddress || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), streetAddress: e.target.value },
                      }))
                    }
                  />
                </div>

                {/* Address Type */}
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">Address Type</label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.addressType || "Home"}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), addressType: e.target.value },
                      }))
                    }
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold transition shadow-md"
                    onClick={() => {
                      const { streetAddress, city, pincode } = editData?.address || {};
                      if (!streetAddress || !city || !pincode) {
                        enqueueSnackbar("Please fill out street address, city, and pincode.", { variant: "error" });
                        return;
                      }
                      setShowAddressModal(false);
                    }}
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </Dialog>
        )}

        {/* Delete Account Modal */}
        <Dialog
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: "1rem",
              border: "2px solid #ef4444",
              boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.25), 0 8px 10px -6px rgba(239, 68, 68, 0.2)",
            },
          }}
        >
          <DialogTitle className="font-bold text-red-600 flex items-center gap-2 border-b border-red-100 dark:border-red-900/50">
            ⚠️ Delete Account Confirmation
          </DialogTitle>
          <DialogContent dividers className="space-y-3 text-sm">
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              Are you sure you want to permanently delete your account (<span className="font-bold">{dbData?.email}</span>)?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              This action cannot be undone. All your profile data, saved delivery addresses, and account details will be permanently removed from Madhu Dairy.
            </p>
          </DialogContent>
          <DialogActions className="p-3 border-t border-red-100 dark:border-red-900/50">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-md transition disabled:opacity-50"
            >
              {isDeleting ? "Deleting Account..." : "Yes, Delete My Account"}
            </button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  if (!dbData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">Unable to fetch user data, please try again.</div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Header Bar (Hidden on Mobile) */}
      <div className="hidden md:flex shrink-0 pb-4 mb-4 border-b border-gray-200/80 dark:border-gray-700/80 justify-between items-center">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaUser className="text-[#6C5CE7]" />
            {edit ? "Edit Personal Details" : "Account Information"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {edit ? "Update your personal details & profile options." : "Manage your profile, orders, addresses, and settings."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEdit(!edit)}
          className="px-3.5 py-1.5 text-xs bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold rounded-xl transition duration-300 flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <FaEdit />
          {edit ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pr-1 pb-28 sm:pb-8">
        {content}
      </div>
    </div>
  );
}
